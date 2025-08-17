import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Provision Vapi phone number
export const provisionVapiPhoneNumber = action({
  args: {
    salonId: v.id("salons"),
    areaCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const VAPI_API_KEY = process.env.VAPI_API_KEY;
      const CONVEX_URL = process.env.CONVEX_URL || 'https://your-app.convex.site';
      const VAPI_WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET || 'your-webhook-secret';
      
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY not configured");
      }
      
      // 1. Provision phone number from Vapi
      const phoneResponse = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'vapi',
          numberDesiredAreaCode: args.areaCode || '415',
          name: `Salon ${args.salonId}`,
          server: {
            url: `${CONVEX_URL}/vapiWebhook`,
            timeoutSeconds: 20,
            headers: {},
            backoffPlan: {
              type: 'fixed',
              maxRetries: 0,
              baseDelaySeconds: 1
            }
          }
        }),
      });
      
      if (!phoneResponse.ok) {
        const error = await phoneResponse.text();
        throw new Error(`Failed to provision phone number: ${error}`);
      }
      
      const phoneData = await phoneResponse.json();
      console.log("Phone provisioned:", phoneData);
      
      // 2. Create Vapi assistant
      const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Salon ${args.salonId} Assistant`,
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: 'en',
          },
          model: {
            provider: 'custom-llm',
            url: `${CONVEX_URL}/vapiWebhook`,
            method: 'POST',
          },
          voice: {
            provider: 'elevenlabs',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
            stability: 0.5,
            similarityBoost: 0.75,
          },
          firstMessage: 'Hello! Thank you for calling. How can I help you today?',
          serverUrl: `${CONVEX_URL}/vapiWebhook`,
          serverUrlSecret: VAPI_WEBHOOK_SECRET,
        }),
      });
      
      if (!assistantResponse.ok) {
        const error = await assistantResponse.text();
        // Clean up phone number if assistant creation fails
        await fetch(`https://api.vapi.ai/phone-number/${phoneData.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
          },
        });
        throw new Error(`Failed to create assistant: ${error}`);
      }
      
      const assistantData = await assistantResponse.json();
      console.log("Assistant created:", assistantData);
      
      // 3. Assign assistant to phone number
      const assignResponse = await fetch(`https://api.vapi.ai/phone-number/${phoneData.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantData.id,
        }),
      });
      
      if (!assignResponse.ok) {
        const error = await assignResponse.text();
        console.error("Failed to assign assistant to phone number:", error);
      }
      
      // 4. Update salon with Vapi configuration
      await ctx.runMutation(api.vapiConfiguration.updateSalonVapiConfig, {
        salonId: args.salonId,
        vapiPhoneNumberId: phoneData.id,
        vapiPhoneNumber: phoneData.number,
        vapiAssistantId: assistantData.id,
        vapiWebhookSecret: VAPI_WEBHOOK_SECRET,
        vapiIsActive: true,
      });
      
      return {
        success: true,
        phoneNumber: phoneData.number,
        phoneNumberId: phoneData.id,
        assistantId: assistantData.id,
      };
    } catch (error) {
      console.error('Vapi provisioning error:', error);
      throw error;
    }
  },
});

// Update salon Vapi configuration
export const updateSalonVapiConfig = mutation({
  args: {
    salonId: v.id("salons"),
    vapiPhoneNumberId: v.string(),
    vapiPhoneNumber: v.string(),
    vapiAssistantId: v.string(),
    vapiWebhookSecret: v.string(),
    vapiIsActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      vapiPhoneNumberId: args.vapiPhoneNumberId,
      vapiPhoneNumber: args.vapiPhoneNumber,
      vapiAssistantId: args.vapiAssistantId,
      vapiWebhookSecret: args.vapiWebhookSecret,
      vapiIsActive: args.vapiIsActive,
    });
    
    return { success: true };
  },
});

// Update voice configuration
export const updateVoiceConfiguration = mutation({
  args: {
    salonId: v.id("salons"),
    voiceProvider: v.union(v.literal("elevenlabs"), v.literal("playht"), v.literal("azure")),
    voiceId: v.string(),
    voiceSettings: v.object({
      speed: v.number(),
      pitch: v.number(),
      temperature: v.number(),
      stability: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      voiceProvider: args.voiceProvider,
      voiceId: args.voiceId,
      voiceSettings: args.voiceSettings,
    });
    
    // TODO: Update Vapi assistant with new voice settings
    const salon = await ctx.db.get(args.salonId);
    if (salon?.vapiAssistantId) {
      // This would call Vapi API to update assistant voice
      console.log("TODO: Update Vapi assistant voice settings");
    }
    
    return { success: true };
  },
});

// Update business context
export const updateBusinessContext = mutation({
  args: {
    salonId: v.id("salons"),
    businessContext: v.object({
      businessHours: v.object({
        monday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        tuesday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        wednesday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        thursday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        friday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        saturday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
        sunday: v.object({ open: v.number(), close: v.number(), isOpen: v.boolean() }),
      }),
      policies: v.object({
        cancellationPolicy: v.string(),
        depositRequired: v.boolean(),
        depositAmount: v.number(),
        latePolicy: v.string(),
        refundPolicy: v.string(),
      }),
      promotions: v.optional(v.array(v.object({
        title: v.string(),
        description: v.string(),
        discount: v.number(),
        validUntil: v.number(),
        conditions: v.array(v.string()),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      businessContext: args.businessContext,
    });
    
    return { success: true };
  },
});

// Deactivate Vapi service
export const deactivateVapiService = action({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    try {
      const salon = await ctx.runQuery(api.salons.getSalonById, { salonId: args.salonId });
      
      if (!salon || !salon.vapiPhoneNumberId) {
        throw new Error("Vapi service not configured for this salon");
      }
      
      const VAPI_API_KEY = process.env.VAPI_API_KEY;
      
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY not configured");
      }
      
      // 1. Delete phone number from Vapi
      const deleteResponse = await fetch(`https://api.vapi.ai/phone-number/${salon.vapiPhoneNumberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      });
      
      if (!deleteResponse.ok) {
        console.error("Failed to delete Vapi phone number");
      }
      
      // 2. Delete assistant if exists
      if (salon.vapiAssistantId) {
        await fetch(`https://api.vapi.ai/assistant/${salon.vapiAssistantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
          },
        });
      }
      
      // 3. Update salon to remove Vapi configuration
      await ctx.runMutation(api.vapiConfiguration.clearVapiConfig, {
        salonId: args.salonId,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Vapi deactivation error:', error);
      throw error;
    }
  },
});

// Clear Vapi configuration from salon
export const clearVapiConfig = mutation({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, {
      vapiPhoneNumberId: undefined,
      vapiPhoneNumber: undefined,
      vapiAssistantId: undefined,
      vapiWebhookSecret: undefined,
      vapiIsActive: false,
    });
    
    return { success: true };
  },
});

// Get Vapi configuration for a salon
export const getVapiConfiguration = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    
    if (!salon) {
      return null;
    }
    
    return {
      isActive: salon.vapiIsActive || false,
      phoneNumber: salon.vapiPhoneNumber,
      phoneNumberId: salon.vapiPhoneNumberId,
      assistantId: salon.vapiAssistantId,
      voiceProvider: salon.voiceProvider,
      voiceId: salon.voiceId,
      voiceSettings: salon.voiceSettings,
      businessContext: salon.businessContext,
    };
  },
});

// Test Vapi configuration
export const testVapiConfiguration = action({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    assistant?: {
      id: string;
      name: string;
      voice: any;
      firstMessage: string;
    };
    phoneNumber?: string;
    error?: string;
  }> => {
    try {
      const salon: any = await ctx.runQuery(api.salons.getSalonById, { salonId: args.salonId });
      
      if (!salon || !salon.vapiAssistantId) {
        throw new Error("Vapi not configured for this salon");
      }
      
      const VAPI_API_KEY = process.env.VAPI_API_KEY;
      
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY not configured");
      }
      
      // Test assistant endpoint
      const response: Response = await fetch(`https://api.vapi.ai/assistant/${salon.vapiAssistantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch assistant details");
      }
      
      const assistant: any = await response.json();
      
      return {
        success: true,
        assistant: {
          id: assistant.id,
          name: assistant.name,
          voice: assistant.voice,
          firstMessage: assistant.firstMessage,
        },
        phoneNumber: salon.vapiPhoneNumber,
      };
    } catch (error) {
      console.error('Vapi test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Get call analytics
export const getCallAnalytics = query({
  args: {
    salonId: v.id("salons"),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const calls = await ctx.db
      .query("vapiCalls")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();
    
    // Filter by date range if provided
    const filteredCalls = args.dateRange
      ? calls.filter(call => 
          call.startTime >= args.dateRange!.start && 
          call.startTime <= args.dateRange!.end
        )
      : calls;
    
    // Calculate analytics
    const totalCalls = filteredCalls.length;
    const completedCalls = filteredCalls.filter(c => c.status === "completed").length;
    const averageDuration = filteredCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls || 0;
    const bookingOutcomes = filteredCalls.filter(c => c.outcome === "booking").length;
    const transferOutcomes = filteredCalls.filter(c => c.outcome === "transfer").length;
    
    return {
      totalCalls,
      completedCalls,
      averageDuration,
      bookingOutcomes,
      transferOutcomes,
      conversionRate: totalCalls > 0 ? (bookingOutcomes / totalCalls) * 100 : 0,
      calls: filteredCalls.slice(0, 10), // Return last 10 calls
    };
  },
});