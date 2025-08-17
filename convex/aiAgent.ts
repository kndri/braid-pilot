import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Enable AI Agent for a salon
export const enableAIAgent = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    await ctx.db.patch(args.salonId, {
      isAIagentEnabled: true,
      aiAgentLanguage: "en",
      aiAgentPersonality: "professional",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Disable AI Agent for a salon
export const disableAIAgent = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    await ctx.db.patch(args.salonId, {
      isAIagentEnabled: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Provision a Twilio phone number for the salon
export const provisionPhoneNumber = action({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    // In a real implementation, this would call Twilio API to provision a number
    // For now, we'll simulate it with a mock number
    const mockPhoneNumber = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;

    await ctx.runMutation(api.aiAgent.updateSalonPhoneConfig, {
      salonId: args.salonId,
      twilioPhoneNumber: mockPhoneNumber,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "test_sid",
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "test_token",
    });

    return { success: true, phoneNumber: mockPhoneNumber };
  },
});

// Update salon phone configuration
export const updateSalonPhoneConfig = mutation({
  args: {
    salonId: v.id("salons"),
    twilioPhoneNumber: v.string(),
    twilioAccountSid: v.string(),
    twilioAuthToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      twilioPhoneNumber: args.twilioPhoneNumber,
      twilioAccountSid: args.twilioAccountSid,
      twilioAuthToken: args.twilioAuthToken,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update AI agent settings
export const updateAIAgentSettings = mutation({
  args: {
    salonId: v.id("salons"),
    aiAgentPersonality: v.optional(v.string()),
    aiAgentPrompt: v.optional(v.string()),
    aiAgentLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };
    
    if (args.aiAgentPersonality) updates.aiAgentPersonality = args.aiAgentPersonality;
    if (args.aiAgentPrompt) updates.aiAgentPrompt = args.aiAgentPrompt;
    if (args.aiAgentLanguage) updates.aiAgentLanguage = args.aiAgentLanguage;

    await ctx.db.patch(args.salonId, updates);
    return { success: true };
  },
});

// Create communication log entry
export const createCommunicationLog = mutation({
  args: {
    salonId: v.id("salons"),
    clientPhone: v.string(),
    communicationType: v.union(v.literal("call"), v.literal("sms")),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    content: v.string(),
    status: v.union(v.literal("received"), v.literal("processed"), v.literal("completed")),
    metadata: v.optional(v.object({
      callSid: v.optional(v.string()),
      messageSid: v.optional(v.string()),
      callDuration: v.optional(v.number()),
      smsCount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communicationLogs", {
      salonId: args.salonId,
      clientPhone: args.clientPhone,
      communicationType: args.communicationType,
      direction: args.direction,
      content: args.content,
      status: args.status,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// Update communication log with AI response
export const updateCommunicationLog = mutation({
  args: {
    logId: v.id("communicationLogs"),
    aiResponse: v.optional(v.string()),
    status: v.optional(v.union(v.literal("received"), v.literal("processed"), v.literal("completed"))),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      clientIntent: v.optional(v.string()),
      followUpSent: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    
    if (args.aiResponse) updates.aiResponse = args.aiResponse;
    if (args.status) updates.status = args.status;
    if (args.completedAt) updates.completedAt = args.completedAt;
    if (args.metadata) updates.metadata = args.metadata;

    await ctx.db.patch(args.logId, updates);
    return { success: true };
  },
});

// Get communication logs for a salon
export const getCommunicationLogs = query({
  args: {
    salonId: v.id("salons"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("communicationLogs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

// Webhook endpoint for Twilio/Vapi incoming communications
export const handleIncomingCommunication = action({
  args: {
    salonId: v.id("salons"),
    communicationType: v.union(v.literal("call"), v.literal("sms")),
    clientPhone: v.string(),
    content: v.string(), // Transcribed speech or SMS text
    callSid: v.optional(v.string()), // Twilio call identifier
    messageSid: v.optional(v.string()), // Twilio message identifier
  },
  handler: async (ctx, args) => {
    try {
      // 1. Log the incoming communication
      const logId = await ctx.runMutation(api.aiAgent.createCommunicationLog, {
        salonId: args.salonId,
        clientPhone: args.clientPhone,
        communicationType: args.communicationType,
        direction: "inbound",
        content: args.content,
        status: "received",
        metadata: {
          callSid: args.callSid,
          messageSid: args.messageSid,
        },
      });

      // 2. Fetch salon configuration and pricing data
      const salon = await ctx.runQuery(api.salons.getSalonById, { 
        salonId: args.salonId 
      });
      
      if (!salon || !salon.isAIagentEnabled) {
        throw new Error("AI agent not enabled for this salon");
      }

      // 3. Generate AI response using Gemini
      const aiResponse = await generateAIResponse(ctx, args.content, salon);
      
      // 4. Update communication log with AI response
      await ctx.runMutation(api.aiAgent.updateCommunicationLog, {
        logId,
        aiResponse,
        status: "processed",
      });

      // 5. Handle response based on communication type
      if (args.communicationType === "call") {
        await handleVoiceResponse(ctx, args, aiResponse, salon);
      } else {
        await handleSMSResponse(ctx, args, aiResponse, salon);
      }

      // 6. Mark communication as completed
      await ctx.runMutation(api.aiAgent.updateCommunicationLog, {
        logId,
        status: "completed",
        completedAt: Date.now(),
      });

      return { success: true, response: aiResponse };
    } catch (error) {
      console.error("AI communication error:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Generate AI response using Gemini
async function generateAIResponse(ctx: any, clientQuery: string, salon: any): Promise<string> {
  const prompt = buildAIPrompt(clientQuery, salon);
  
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error("No response from Gemini API");
    }

    return aiText.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return `I apologize, but I'm having trouble processing your request right now. Please try calling back in a few minutes or visit our website for more information about ${salon.name}.`;
  }
}

// Build context-aware prompt for AI
function buildAIPrompt(clientQuery: string, salon: any): string {
  const personality = salon.aiAgentPersonality || "professional";
  const customPrompt = salon.aiAgentPrompt || "";
  
  let personalityInstruction = "";
  switch (personality) {
    case "friendly":
      personalityInstruction = "Be warm, friendly, and enthusiastic while maintaining professionalism.";
      break;
    case "casual":
      personalityInstruction = "Be relaxed and conversational, but still helpful and informative.";
      break;
    default: // professional
      personalityInstruction = "Be professional, courteous, and helpful.";
  }

  return `You are an AI assistant for ${salon.name}, a professional hair braiding salon.

SALON CONTEXT:
- Salon Name: ${salon.name}
- Location: ${salon.address || "Contact for location details"}
- Phone: ${salon.phone || "Contact through this number"}
- Services: Professional hair braiding including Box Braids, Knotless Braids, and other styles

PERSONALITY: ${personalityInstruction}

${customPrompt ? `CUSTOM INSTRUCTIONS: ${customPrompt}` : ""}

CLIENT QUERY: "${clientQuery}"

INSTRUCTIONS:
1. Answer questions about services, pricing, and availability
2. If they ask about pricing, let them know we have competitive rates and direct them to our online price calculator
3. If they want to book, provide our booking information
4. Keep responses concise but informative (under 160 characters for SMS)
5. Always mention our salon name and encourage them to visit or use our online tools
6. Be helpful even if you don't have specific information

IMPORTANT: Keep your response under 160 characters if this is for SMS.

RESPONSE:`;
}

// Handle voice call response
async function handleVoiceResponse(ctx: any, args: any, aiResponse: string, salon: any) {
  if (!args.callSid || !salon.twilioAccountSid || !salon.twilioAuthToken) return;

  try {
    // Convert AI response to speech using Twilio TTS
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${salon.twilioAccountSid}/Calls/${args.callSid}.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${salon.twilioAccountSid}:${salon.twilioAuthToken}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          TwiML: `<Response><Say voice="alice">${aiResponse.replace(/[<>&"']/g, '')}</Say></Response>`
        })
      }
    );

    if (!twilioResponse.ok) {
      throw new Error(`Twilio TTS failed: ${twilioResponse.statusText}`);
    }
  } catch (error) {
    console.error("Voice response error:", error);
  }
}

// Handle SMS response
async function handleSMSResponse(ctx: any, args: any, aiResponse: string, salon: any) {
  if (!salon.twilioAccountSid || !salon.twilioAuthToken || !salon.twilioPhoneNumber) return;

  try {
    // Send SMS response using Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${salon.twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${salon.twilioAccountSid}:${salon.twilioAuthToken}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: args.clientPhone,
          From: salon.twilioPhoneNumber,
          Body: aiResponse,
        })
      }
    );

    if (!twilioResponse.ok) {
      throw new Error(`Twilio SMS failed: ${twilioResponse.statusText}`);
    }

    // Send follow-up with booking links if client shows interest
    if (shouldSendFollowUp(args.content)) {
      await sendFollowUpLinks(ctx, args.clientPhone, salon);
    }
  } catch (error) {
    console.error("SMS response error:", error);
  }
}

// Determine if follow-up links should be sent
function shouldSendFollowUp(content: string): boolean {
  const interestKeywords = [
    "price", "cost", "how much", "book", "appointment", "schedule",
    "available", "when", "time", "service", "braids", "hair", "quote"
  ];
  
  return interestKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Send follow-up SMS with booking links
async function sendFollowUpLinks(ctx: any, clientPhone: string, salon: any) {
  if (!salon.quoteToolUrl) return;

  const followUpMessage = `Thank you for your interest in ${salon.name}! 

Get an instant quote: ${salon.quoteToolUrl}
📱 Text us anytime for questions!

We look forward to serving you! ✨`;

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${salon.twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${salon.twilioAccountSid}:${salon.twilioAuthToken}`).toString('base64')}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: clientPhone,
          From: salon.twilioPhoneNumber,
          Body: followUpMessage,
        })
      }
    );
  } catch (error) {
    console.error("Follow-up SMS error:", error);
  }
}