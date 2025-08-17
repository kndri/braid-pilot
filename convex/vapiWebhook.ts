import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper function to validate Vapi webhook signature
function validateVapiSignature(signature: string | undefined, timestamp: string | undefined, body: string, secret: string): boolean {
  if (!signature || !timestamp) return false;
  
  // In production, implement proper HMAC validation
  // For now, we'll do basic validation
  const currentTime = Date.now();
  const webhookTime = parseInt(timestamp);
  
  // Check if webhook is not older than 5 minutes
  if (currentTime - webhookTime > 5 * 60 * 1000) {
    return false;
  }
  
  // TODO: Implement proper HMAC-SHA256 signature validation
  return true;
}

// Main Vapi webhook handler - exposed as HTTP action
export const handleWebhook = action({
  args: {
    type: v.string(),
    call: v.object({
      id: v.string(),
      phoneNumber: v.optional(v.string()),
      phoneNumberId: v.optional(v.string()),
      customerId: v.optional(v.string()),
    }),
    message: v.optional(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.optional(v.number()),
    })),
    transcript: v.optional(v.string()),
    functionCall: v.optional(v.object({
      name: v.string(),
      arguments: v.any(),
    })),
    timestamp: v.optional(v.string()),
    signature: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log("Vapi webhook received:", args.type);
    
    try {
      // Log the webhook event
      await ctx.runMutation(api.vapiWebhook.logWebhookEvent, {
        callId: args.call.id,
        eventType: args.type as any,
        payload: args,
      });

      // Handle different event types
      switch (args.type) {
        case 'call-started':
          return await handleCallStarted(ctx, args);
        case 'speech-update':
          return await handleSpeechUpdate(ctx, args);
        case 'function-call':
          return await handleFunctionCall(ctx, args);
        case 'call-ended':
          return await handleCallEnded(ctx, args);
        case 'error':
          return await handleError(ctx, args);
        default:
          console.warn('Unknown webhook event type:', args.type);
          return { success: true };
      }
    } catch (error) {
      console.error("Vapi webhook error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Handle call started event
async function handleCallStarted(ctx: any, args: any): Promise<any> {
  const { call } = args;
  
  // Find salon by phone number ID
  const salon: any = await ctx.runQuery(api.vapiWebhook.getSalonByPhoneNumberId, {
    phoneNumberId: call.phoneNumberId,
  });
  
  if (!salon) {
    console.error("Salon not found for phone number ID:", call.phoneNumberId);
    return { success: false, error: "Salon not found" };
  }
  
  // Create call record
  await ctx.runMutation(api.vapiWebhook.createCallRecord, {
    callId: call.id,
    salonId: salon._id,
    phoneNumber: call.phoneNumber || "Unknown",
    status: "answered",
  });
  
  // Get business context for initial greeting
  const context: any = await getBusinessContext(ctx, salon._id);
  
  return {
    success: true,
    message: `Hello! Thank you for calling ${salon.name}. How can I help you today?`,
    context,
  };
}

// Handle speech update (user speaking)
async function handleSpeechUpdate(ctx: any, args: any) {
  const { call, message, transcript } = args;
  
  if (!transcript || transcript.trim().length === 0) {
    return { success: true };
  }
  
  // Get call record
  const callRecord = await ctx.runQuery(api.vapiWebhook.getCallRecord, {
    callId: call.id,
  });
  
  if (!callRecord) {
    console.error("Call record not found:", call.id);
    return { success: false, error: "Call record not found" };
  }
  
  // Add user message to conversation
  if (message) {
    await ctx.runMutation(api.vapiWebhook.addMessage, {
      callId: call.id,
      role: "user",
      content: message.content,
    });
  }
  
  // Generate AI response
  const response = await generateAIResponse(ctx, callRecord.salonId, transcript, call.id);
  
  // Add assistant message to conversation
  await ctx.runMutation(api.vapiWebhook.addMessage, {
    callId: call.id,
    role: "assistant",
    content: response.content,
  });
  
  return {
    success: true,
    message: response.content,
    functionCall: response.functionCall,
    endCall: response.endCall,
  };
}

// Handle function calls
async function handleFunctionCall(ctx: any, args: any) {
  const { call, functionCall } = args;
  
  if (!functionCall) return { success: true };
  
  console.log("Function call:", functionCall.name, functionCall.arguments);
  
  switch (functionCall.name) {
    case 'book_appointment':
      return await handleBookingFunction(ctx, call.id, functionCall.arguments);
    case 'get_pricing':
      return await handlePricingFunction(ctx, call.id, functionCall.arguments);
    case 'check_availability':
      return await handleAvailabilityFunction(ctx, call.id, functionCall.arguments);
    case 'transfer_to_human':
      return await handleTransferFunction(ctx, call.id, functionCall.arguments);
    default:
      console.warn('Unknown function call:', functionCall.name);
      return { 
        success: true,
        message: "I'm not sure how to help with that. Would you like to speak with someone?" 
      };
  }
}

// Handle call ended
async function handleCallEnded(ctx: any, args: any) {
  const { call } = args;
  
  await ctx.runMutation(api.vapiWebhook.endCall, {
    callId: call.id,
    endTime: Date.now(),
  });
  
  // Calculate call metrics
  const callRecord = await ctx.runQuery(api.vapiWebhook.getCallRecord, {
    callId: call.id,
  });
  
  if (callRecord) {
    const duration = Date.now() - callRecord.startTime;
    const messageCount = callRecord.messages.length;
    
    await ctx.runMutation(api.vapiWebhook.updateCallMetrics, {
      callId: call.id,
      duration,
      messageCount,
    });
  }
  
  return { success: true };
}

// Handle errors
async function handleError(ctx: any, args: any) {
  console.error("Vapi error event:", args);
  
  await ctx.runMutation(api.vapiWebhook.logError, {
    callId: args.call.id,
    error: JSON.stringify(args),
  });
  
  return { success: true };
}

// Generate AI response using Gemini
async function generateAIResponse(ctx: any, salonId: string, transcript: string, callId: string) {
  try {
    // Get salon and conversation history
    const salon = await ctx.runQuery(api.salons.getSalonById, { salonId });
    const callRecord = await ctx.runQuery(api.vapiWebhook.getCallRecord, { callId });
    
    if (!salon) {
      throw new Error("Salon not found");
    }
    
    // Build context-aware prompt
    const prompt = buildPrompt(salon, transcript, callRecord?.messages || []);
    
    // Call Gemini API (mock for now)
    // In production, this would call the actual Gemini API
    const response = await mockGeminiResponse(prompt, transcript);
    
    return response;
  } catch (error) {
    console.error("AI response error:", error);
    return {
      content: "I apologize, but I'm having trouble understanding. Could you please repeat that?",
      functionCall: null,
      endCall: false,
    };
  }
}

// Build AI prompt with context
function buildPrompt(salon: any, transcript: string, history: any[]) {
  const context = salon.businessContext || {};
  
  let prompt = `You are a professional Virtual Receptionist for ${salon.name}, a hair braiding salon.\n\n`;
  
  if (context.businessHours) {
    prompt += `Business Hours: ${formatBusinessHours(context.businessHours)}\n`;
  }
  
  if (context.policies) {
    prompt += `Policies:\n`;
    prompt += `- Cancellation: ${context.policies.cancellationPolicy}\n`;
    prompt += `- Deposit: ${context.policies.depositRequired ? `$${context.policies.depositAmount} required` : 'No deposit required'}\n`;
  }
  
  if (history.length > 0) {
    prompt += `\nConversation History:\n`;
    history.slice(-5).forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
  }
  
  prompt += `\nCurrent User Input: "${transcript}"\n`;
  prompt += `\nProvide a helpful, professional response. If they want to book an appointment, use the book_appointment function.`;
  
  return prompt;
}

// Mock Gemini response for testing
async function mockGeminiResponse(prompt: string, transcript: string) {
  const lowerTranscript = transcript.toLowerCase();
  
  // Check for booking intent
  if (lowerTranscript.includes('book') || lowerTranscript.includes('appointment') || lowerTranscript.includes('schedule')) {
    return {
      content: "I'd be happy to help you book an appointment! What style are you interested in, and when would you like to come in?",
      functionCall: null,
      endCall: false,
    };
  }
  
  // Check for pricing questions
  if (lowerTranscript.includes('price') || lowerTranscript.includes('cost') || lowerTranscript.includes('how much')) {
    return {
      content: "Our prices vary depending on the style and size you choose. Box braids start at $150, and knotless braids start at $180. Would you like a specific quote?",
      functionCall: null,
      endCall: false,
    };
  }
  
  // Check for availability
  if (lowerTranscript.includes('available') || lowerTranscript.includes('open') || lowerTranscript.includes('hours')) {
    return {
      content: "We're open Tuesday through Saturday from 9 AM to 6 PM. Would you like to check availability for a specific date?",
      functionCall: null,
      endCall: false,
    };
  }
  
  // Default response
  return {
    content: "I'd be happy to help you with that. Could you tell me more about what you're looking for?",
    functionCall: null,
    endCall: false,
  };
}

// Format business hours for display
function formatBusinessHours(hours: any) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let formatted = [];
  
  for (const day of days) {
    const dayLower = day.toLowerCase();
    if (hours[dayLower] && hours[dayLower].isOpen) {
      const open = formatTime(hours[dayLower].open);
      const close = formatTime(hours[dayLower].close);
      formatted.push(`${day}: ${open} - ${close}`);
    }
  }
  
  return formatted.join(', ');
}

// Format time from number to string
function formatTime(time: number): string {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Get business context for a salon
async function getBusinessContext(ctx: any, salonId: string): Promise<any> {
  const salon: any = await ctx.runQuery(api.salons.getSalonById, { salonId });
  
  if (!salon || !salon.businessContext) {
    return null;
  }
  
  return {
    businessHours: salon.businessContext.businessHours,
    policies: salon.businessContext.policies,
    promotions: salon.businessContext.promotions,
  };
}

// Handler functions for specific actions
async function handleBookingFunction(ctx: any, callId: string, args: any) {
  // Implementation for booking
  return {
    success: true,
    message: "Let me help you book an appointment. What date and time works best for you?",
  };
}

async function handlePricingFunction(ctx: any, callId: string, args: any) {
  // Implementation for pricing
  return {
    success: true,
    message: "Our pricing depends on the style you choose. Box braids start at $150. What style are you interested in?",
  };
}

async function handleAvailabilityFunction(ctx: any, callId: string, args: any) {
  // Implementation for availability checking
  return {
    success: true,
    message: "Let me check our availability. What day were you hoping to come in?",
  };
}

async function handleTransferFunction(ctx: any, callId: string, args: any) {
  // Implementation for transfer to human
  return {
    success: true,
    message: "I'll transfer you to one of our stylists. Please hold for just a moment.",
    transfer: true,
  };
}

// Mutations for database operations
export const logWebhookEvent = mutation({
  args: {
    callId: v.string(),
    eventType: v.union(v.literal("speech-update"), v.literal("function-call"), v.literal("call-end"), v.literal("error")),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("vapiWebhookEvents", {
      callId: args.callId,
      eventType: args.eventType,
      payload: args.payload,
      processed: false,
      createdAt: Date.now(),
    });
  },
});

export const createCallRecord = mutation({
  args: {
    callId: v.string(),
    salonId: v.id("salons"),
    phoneNumber: v.string(),
    status: v.union(v.literal("ringing"), v.literal("answered"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("vapiCalls", {
      callId: args.callId,
      salonId: args.salonId,
      phoneNumber: args.phoneNumber,
      status: args.status,
      startTime: Date.now(),
      messages: [],
      responseTimes: [],
      interruptionCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addMessage = mutation({
  args: {
    callId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db
      .query("vapiCalls")
      .withIndex("by_callId", (q) => q.eq("callId", args.callId))
      .first();
    
    if (!call) {
      throw new Error("Call not found");
    }
    
    const messages = [...call.messages, {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    }];
    
    await ctx.db.patch(call._id, {
      messages,
      updatedAt: Date.now(),
    });
  },
});

export const endCall = mutation({
  args: {
    callId: v.string(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db
      .query("vapiCalls")
      .withIndex("by_callId", (q) => q.eq("callId", args.callId))
      .first();
    
    if (!call) {
      throw new Error("Call not found");
    }
    
    const duration = args.endTime - call.startTime;
    
    await ctx.db.patch(call._id, {
      status: "completed",
      endTime: args.endTime,
      duration,
      updatedAt: Date.now(),
    });
  },
});

export const updateCallMetrics = mutation({
  args: {
    callId: v.string(),
    duration: v.number(),
    messageCount: v.number(),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db
      .query("vapiCalls")
      .withIndex("by_callId", (q) => q.eq("callId", args.callId))
      .first();
    
    if (!call) {
      throw new Error("Call not found");
    }
    
    // Calculate average response time if we have response times
    const averageResponseTime = call.responseTimes.length > 0
      ? call.responseTimes.reduce((a, b) => a + b, 0) / call.responseTimes.length
      : undefined;
    
    await ctx.db.patch(call._id, {
      duration: args.duration,
      averageResponseTime,
      updatedAt: Date.now(),
    });
  },
});

export const logError = mutation({
  args: {
    callId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("vapiWebhookEvents", {
      callId: args.callId,
      eventType: "error",
      payload: { error: args.error },
      processed: true,
      error: args.error,
      createdAt: Date.now(),
    });
  },
});

// Queries
export const getCallRecord = query({
  args: {
    callId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vapiCalls")
      .withIndex("by_callId", (q) => q.eq("callId", args.callId))
      .first();
  },
});

export const getSalonByPhoneNumberId = query({
  args: {
    phoneNumberId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.phoneNumberId) return null;
    
    return await ctx.db
      .query("salons")
      .filter((q) => q.eq(q.field("vapiPhoneNumberId"), args.phoneNumberId))
      .first();
  },
});

export const getRecentCalls = query({
  args: {
    salonId: v.id("salons"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    return await ctx.db
      .query("vapiCalls")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(limit);
  },
});