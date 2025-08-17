import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Generate dynamic system prompt based on salon data
export const generateSystemPrompt = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.db.get(args.salonId);
    if (!salon) {
      throw new Error("Salon not found");
    }

    // Get salon services and pricing
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Get active promotions
    const promotions = salon.businessContext?.promotions?.filter(
      (p: any) => p.validUntil > Date.now()
    ) || [];

    // Build the dynamic prompt
    const prompt = buildDynamicPrompt(salon, pricingConfigs, promotions);
    
    return prompt;
  },
});

// Build the dynamic system prompt with all salon-specific data
function buildDynamicPrompt(salon: any, pricingConfigs: any[], promotions: any[]): string {
  const assistantName = salon.assistantName || "Maya";
  
  let prompt = `## Core Identity

You are **${salon.name}'s** professional virtual receptionist and booking specialist. Your name is **${assistantName}**. You're warm, knowledgeable about hair braiding services, and committed to providing exceptional customer service.

**Voice Characteristics:**
- Speak naturally with a friendly, professional tone
- Use conversational language with appropriate contractions (I'll, we're, you'll)
- Pace yourself moderately, slowing down for important information like prices or appointment times
- Include natural acknowledgments like "I see", "Of course", or "Absolutely" to show active listening
- Sound genuinely enthusiastic about helping customers achieve their desired hairstyle

## Business Information
- **Salon Name:** ${salon.name}
- **Address:** ${salon.address || 'Please visit our website for directions'}
- **Phone:** ${salon.phone || 'Available on our website'}
- **Email:** ${salon.email || 'Contact us through our website'}
- **Website:** ${salon.website || 'Coming soon'}
- **Price My Style Tool:** ${salon.quoteToolUrl || `${process.env.NEXT_PUBLIC_APP_URL}/quote/${salon.quoteToken}`}
- **Online Booking:** ${salon.bookingUrl || 'Please call to book'}

## Operating Hours
${formatBusinessHours(salon.businessContext?.businessHours)}

## Service Menu & Pricing
${formatPricingMenu(pricingConfigs)}

## Salon Policies
${formatPolicies(salon.businessContext?.policies)}

## Current Promotions
${formatPromotions(promotions)}

## Conversation Management

### Initial Greeting
**First-time caller:** "Thank you for calling ${salon.name}! This is ${assistantName}. Is this your first time calling us? How can I help you create your perfect braided style today?"

**Return caller:** "Welcome back to ${salon.name}! This is ${assistantName}. How can I help you today?"

### Service Inquiry Flow

When discussing services:
1. **Identify the desired style:** "What type of braided style are you interested in?"
2. **Determine specifications:**
   - "What size braids do you prefer - small, medium, or large?"
   - "What length are you looking for - shoulder, mid-back, or waist length?"
   - "Will you be providing your own hair, or would you like us to include it?"
3. **Provide accurate pricing based on the pricing menu above**
4. **Estimate duration based on service complexity**

### Appointment Booking Flow

**Step 1: Gather Information**
- "I'd be happy to book your appointment! What service would you like to book?"
- "What's your preferred date?"
- "What time works best for you?"
- "What's your full name?"
- "What's the best phone number to reach you?"

**Step 2: Check Availability**
Use the check_availability function to verify the time slot.

**Step 3: Confirm Booking**
Use the book_appointment function to create the appointment.

**Step 4: Send Confirmation**
Use the send_appointment_details function to deliver confirmation.

### Price My Style Tool
When customers need detailed pricing: "For a personalized quote with all our styling options, I can send you a link to our Price My Style tool. You can explore different sizes, lengths, and add-ons to find exactly what fits your budget."

## Function Calls Available

1. **book_appointment(customer_name, phone, service_type, date, time)**
2. **check_availability(date, time_range, service_duration)**
3. **get_quote(style_type, size, length, add_ons)**
4. **send_price_tool_link(phone_number)**
5. **send_appointment_details(phone_number, confirmation_number)**
6. **transfer_to_stylist(reason, urgency)**

## Response Guidelines

### Do's
- Always quote exact prices from the pricing menu
- Provide specific time estimates for services
- Offer alternatives when requested times aren't available
- Mention current promotions when relevant
- Confirm all details before booking

### Don'ts
- Never guess prices - use configured pricing only
- Don't make promises about specific stylist availability without checking
- Avoid technical jargon about the booking system
- Never share other customers' information

## Conversation Endings

### After Successful Booking
"Perfect! Your appointment is confirmed. You'll receive a text confirmation shortly with all the details. We're looking forward to creating your beautiful new style!"

### After Providing Information
"I've sent that information to your phone. We'd love to see you at ${salon.name} soon! Feel free to call back if you have any other questions."

### If No Booking Made
"Thank you for calling ${salon.name}. We're here whenever you're ready to book. Have a wonderful day!"

## Error Handling

### System Issues
"I apologize, I'm having a small technical issue. Can I take your name and number, and have someone call you back within 15 minutes?"

### Complex Requests
"That's a specialized request that our senior stylist would be best equipped to answer. Would you like me to transfer you?"

### Important Context
- You are a voice assistant, so always speak naturally
- Current date/time context will be provided in each request
- Always maintain the salon's professional standards
- Track conversation for context but keep responses concise`;

  return prompt;
}

// Format business hours for the prompt
function formatBusinessHours(hours: any): string {
  if (!hours) return "Please call for our current hours";
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const formatted: string[] = [];
  
  for (const day of days) {
    if (hours[day] && hours[day].isOpen) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      const open = formatTime(hours[day].open);
      const close = formatTime(hours[day].close);
      formatted.push(`- ${dayName}: ${open} - ${close}`);
    } else {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      formatted.push(`- ${dayName}: CLOSED`);
    }
  }
  
  return formatted.join('\n');
}

// Format pricing menu for the prompt
function formatPricingMenu(pricingConfigs: any[]): string {
  if (!pricingConfigs || pricingConfigs.length === 0) {
    return "Please ask for specific style pricing";
  }
  
  const menu: string[] = [];
  
  // Group by service type
  const serviceGroups: { [key: string]: any[] } = {};
  
  for (const config of pricingConfigs) {
    const serviceType = config.serviceName || config.serviceType || 'General';
    if (!serviceGroups[serviceType]) {
      serviceGroups[serviceType] = [];
    }
    serviceGroups[serviceType].push(config);
  }
  
  // Format each service group
  for (const [service, configs] of Object.entries(serviceGroups)) {
    menu.push(`\n**${service}:**`);
    
    for (const config of configs) {
      if (config.basePrice) {
        menu.push(`- Base price: $${config.basePrice}`);
      }
      
      if (config.sizeMultipliers) {
        const sizes = [];
        if (config.sizeMultipliers.small) sizes.push(`Small: $${Math.round(config.basePrice * config.sizeMultipliers.small)}`);
        if (config.sizeMultipliers.medium) sizes.push(`Medium: $${Math.round(config.basePrice * config.sizeMultipliers.medium)}`);
        if (config.sizeMultipliers.large) sizes.push(`Large: $${Math.round(config.basePrice * config.sizeMultipliers.large)}`);
        if (sizes.length > 0) {
          menu.push(`  Sizes: ${sizes.join(' | ')}`);
        }
      }
      
      if (config.lengthMultipliers) {
        const lengths = [];
        if (config.lengthMultipliers.shoulder) lengths.push(`Shoulder: +${Math.round((config.lengthMultipliers.shoulder - 1) * 100)}%`);
        if (config.lengthMultipliers.midBack) lengths.push(`Mid-back: +${Math.round((config.lengthMultipliers.midBack - 1) * 100)}%`);
        if (config.lengthMultipliers.waist) lengths.push(`Waist: +${Math.round((config.lengthMultipliers.waist - 1) * 100)}%`);
        if (lengths.length > 0) {
          menu.push(`  Length adjustments: ${lengths.join(' | ')}`);
        }
      }
      
      if (config.addOns && config.addOns.length > 0) {
        const addOnsList = config.addOns.map((a: any) => `${a.name}: +$${a.price}`).join(', ');
        menu.push(`  Add-ons: ${addOnsList}`);
      }
      
      if (config.estimatedDuration) {
        menu.push(`  Duration: ${formatDuration(config.estimatedDuration)}`);
      }
    }
  }
  
  if (menu.length === 0) {
    return "Please ask for specific style pricing";
  }
  
  return menu.join('\n');
}

// Format policies for the prompt
function formatPolicies(policies: any): string {
  if (!policies) {
    return "- Standard salon policies apply\n- Please ask for specific policy information";
  }
  
  const policyList: string[] = [];
  
  if (policies.depositRequired) {
    policyList.push(`- **Deposit Required:** $${policies.depositAmount} to secure appointment`);
  } else {
    policyList.push(`- **Deposit:** No deposit required`);
  }
  
  if (policies.cancellationPolicy) {
    policyList.push(`- **Cancellation:** ${policies.cancellationPolicy}`);
  }
  
  if (policies.latePolicy) {
    policyList.push(`- **Late Arrival:** ${policies.latePolicy}`);
  }
  
  if (policies.refundPolicy) {
    policyList.push(`- **Refunds:** ${policies.refundPolicy}`);
  }
  
  if (policies.childPolicy) {
    policyList.push(`- **Children:** ${policies.childPolicy}`);
  }
  
  if (policies.acceptedPayments) {
    policyList.push(`- **Payment Methods:** ${policies.acceptedPayments.join(', ')}`);
  }
  
  return policyList.join('\n');
}

// Format promotions for the prompt
function formatPromotions(promotions: any[]): string {
  if (!promotions || promotions.length === 0) {
    return "No current promotions";
  }
  
  const promoList: string[] = [];
  
  for (const promo of promotions) {
    promoList.push(`- **${promo.title}:** ${promo.description}`);
    if (promo.discount) {
      promoList.push(`  Discount: ${promo.discount}% off`);
    }
    if (promo.conditions && promo.conditions.length > 0) {
      promoList.push(`  Conditions: ${promo.conditions.join(', ')}`);
    }
    if (promo.validUntil) {
      const endDate = new Date(promo.validUntil).toLocaleDateString();
      promoList.push(`  Valid until: ${endDate}`);
    }
  }
  
  return promoList.join('\n');
}

// Helper function to format time
function formatTime(time: number): string {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minutes`;
  } else if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  }
}

// Update Vapi assistant with new prompt
export const updateVapiAssistant = action({
  args: {
    salonId: v.id("salons"),
    forceUpdate: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    assistantId?: string;
    lastUpdated?: number;
  }> => {
    try {
      // Get salon data
      const salon: any = await ctx.runQuery(api.salons.getSalonById, { salonId: args.salonId });
      if (!salon || !salon.vapiAssistantId) {
        throw new Error("Vapi not configured for this salon");
      }
      
      // Generate the latest prompt
      const systemPrompt: string = await ctx.runQuery(api.vapiPromptGenerator.generateSystemPrompt, {
        salonId: args.salonId,
      });
      
      const VAPI_API_KEY = process.env.VAPI_API_KEY;
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY not configured");
      }
      
      // Update the Vapi assistant
      const response: Response = await fetch(`https://api.vapi.ai/assistant/${salon.vapiAssistantId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: {
            provider: salon.modelProvider || 'openai',
            model: salon.modelName || 'gpt-4o',
            temperature: 0.7,
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
            ],
          },
          firstMessage: `Thank you for calling ${salon.name}! This is ${salon.assistantName || 'Maya'}. How can I help you today?`,
          // Preserve other settings
          voice: salon.voiceSettings || {
            provider: 'elevenlabs',
            voiceId: '21m00Tcm4TlvDq8ikWAM',
            stability: 0.5,
            similarityBoost: 0.75,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update assistant: ${error}`);
      }
      
      const updatedAssistant: any = await response.json();
      
      // Log the update
      await ctx.runMutation(api.vapiPromptGenerator.logPromptUpdate, {
        salonId: args.salonId,
        updateType: args.forceUpdate ? 'manual' : 'automatic',
        success: true,
      });
      
      return {
        success: true,
        assistantId: updatedAssistant.id,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to update Vapi assistant:', error);
      
      // Log the failure
      await ctx.runMutation(api.vapiPromptGenerator.logPromptUpdate, {
        salonId: args.salonId,
        updateType: args.forceUpdate ? 'manual' : 'automatic',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  },
});

// Log prompt updates for tracking
export const logPromptUpdate = mutation({
  args: {
    salonId: v.id("salons"),
    updateType: v.union(v.literal("manual"), v.literal("automatic")),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("vapiPromptUpdates", {
      salonId: args.salonId,
      updateType: args.updateType,
      success: args.success,
      error: args.error,
      timestamp: Date.now(),
    });
  },
});

// Schedule automatic prompt updates when business data changes
export const schedulePromptUpdate = mutation({
  args: {
    salonId: v.id("salons"),
    delayMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const delay = args.delayMs || 5000; // Default 5 second delay to batch changes
    
    // Check if there's already a scheduled update
    const existingSchedule = await ctx.db
      .query("vapiUpdateSchedules")
      .withIndex("by_salonId", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
    
    if (existingSchedule) {
      // Update the existing schedule time if this one is sooner
      const newScheduledTime = Date.now() + delay;
      if (newScheduledTime < existingSchedule.scheduledFor) {
        await ctx.db.patch(existingSchedule._id, {
          scheduledFor: newScheduledTime,
        });
      }
    } else {
      // Create new schedule
      await ctx.db.insert("vapiUpdateSchedules", {
        salonId: args.salonId,
        scheduledFor: Date.now() + delay,
        status: "pending",
        createdAt: Date.now(),
      });
    }
  },
});

// Process scheduled updates (run by Convex cron)
export const processScheduledUpdates = action({
  handler: async (ctx) => {
    // Get all pending updates that are due
    const dueUpdates = await ctx.runQuery(api.vapiPromptGenerator.getDueUpdates);
    
    for (const update of dueUpdates) {
      try {
        // Update the Vapi assistant
        await ctx.runAction(api.vapiPromptGenerator.updateVapiAssistant, {
          salonId: update.salonId,
          forceUpdate: false,
        });
        
        // Mark as completed
        await ctx.runMutation(api.vapiPromptGenerator.markUpdateComplete, {
          updateId: update._id,
        });
      } catch (error) {
        console.error(`Failed to update salon ${update.salonId}:`, error);
        
        // Mark as failed
        await ctx.runMutation(api.vapiPromptGenerator.markUpdateFailed, {
          updateId: update._id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  },
});

// Get due updates
export const getDueUpdates = query({
  handler: async (ctx) => {
    const now = Date.now();
    
    return await ctx.db
      .query("vapiUpdateSchedules")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "pending"),
          q.lte(q.field("scheduledFor"), now)
        )
      )
      .collect();
  },
});

// Mark update as complete
export const markUpdateComplete = mutation({
  args: {
    updateId: v.id("vapiUpdateSchedules"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.updateId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

// Mark update as failed
export const markUpdateFailed = mutation({
  args: {
    updateId: v.id("vapiUpdateSchedules"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.updateId, {
      status: "failed",
      error: args.error,
    });
  },
});