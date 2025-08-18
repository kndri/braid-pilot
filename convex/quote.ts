import { query } from "./_generated/server";
import { v } from "convex/values";

// Public query to get pricing data for a salon's quote tool
export const getSalonPricingByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find salon by username first
    let salon = await ctx.db
      .query("salons")
      .withIndex("by_username", (q) => q.eq("username", args.token))
      .first();
    
    // Fallback to token lookup if username not found
    if (!salon) {
      salon = await ctx.db
        .query("salons")
        .filter((q) => q.eq(q.field("onboardingToken"), args.token))
        .first();
    }
    
    if (!salon) {
      return null;
    }
    
    // Check if salon has completed onboarding
    const owner = await ctx.db.get(salon.ownerId);
    if (!owner || !owner.onboardingComplete) {
      return {
        salonId: salon._id,
        salonName: salon.name,
        isActive: false,
        message: "This braider's price list is not yet available",
      };
    }
    
    // Get selected styles for the salon
    const salonStyles = await ctx.db
      .query("salonStyles")
      .withIndex("by_salonId", (q) => q.eq("salonId", salon._id))
      .collect();
    
    // Get all pricing configs for the salon
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId", (q) => q.eq("salonId", salon._id))
      .collect();
    
    // Structure the pricing data
    const stylesData: Record<string, any> = {};
    
    // Group configs by style
    salonStyles.forEach(style => {
      const styleConfigs = pricingConfigs.filter(
        config => config.styleName === style.styleName
      );
      
      const basePrice = styleConfigs.find(
        c => c.adjustmentType === "base_price"
      )?.adjustmentValue || 0;
      
      const lengthAdjustments: Record<string, number> = {};
      const sizeAdjustments: Record<string, number> = {};
      const hairTypeAdjustments: Record<string, number> = {};
      let curlyHairAdjustment = null;
      
      styleConfigs.forEach(config => {
        switch (config.adjustmentType) {
          case "length_adj":
            lengthAdjustments[config.adjustmentLabel] = config.adjustmentValue;
            break;
          case "size_adj":
            sizeAdjustments[config.adjustmentLabel] = config.adjustmentValue;
            break;
          case "hair_type_adj":
            hairTypeAdjustments[config.adjustmentLabel] = config.adjustmentValue;
            break;
          case "curly_hair_adj":
            curlyHairAdjustment = {
              label: config.adjustmentLabel,
              value: config.adjustmentValue,
              metadata: config.metadata,
            };
            break;
        }
      });
      
      stylesData[style.styleName] = {
        name: style.styleName,
        basePrice,
        lengthAdjustments,
        sizeAdjustments,
        hairTypeAdjustments,
        curlyHairAdjustment,
        isCustom: style.isCustom,
        displayOrder: style.displayOrder,
      };
    });
    
    // Get unique hair types from configs
    const hairTypes = new Set<string>();
    pricingConfigs
      .filter(c => c.adjustmentType === "hair_type_adj")
      .forEach(c => hairTypes.add(c.adjustmentLabel));
    
    // Add the standard hair type if set
    if (salon.standardHairType) {
      hairTypes.add(salon.standardHairType);
    }
    
    return {
      salonId: salon._id,
      salonName: salon.name,
      salonEmail: salon.email,
      salonPhone: salon.phone,
      standardHairType: salon.standardHairType || "Synthetic",
      isActive: true,
      styles: Object.values(stylesData).sort((a: any, b: any) => 
        a.displayOrder - b.displayOrder
      ),
      availableHairTypes: Array.from(hairTypes).sort(),
      // Define available sizes and lengths (standard options)
      availableSizes: ["Small", "Medium", "Large", "Jumbo", "XL"],
      availableLengths: ["Shoulder-Length", "Bra-Length", "Mid-Back", "Waist-Length"],
    };
  },
});

// Calculate final price based on selections
export const calculateQuotePrice = query({
  args: {
    token: v.string(),
    styleName: v.string(),
    size: v.string(),
    length: v.string(),
    hairType: v.string(),
    includeCurlyHair: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Try to find salon by username first
    let salon = await ctx.db
      .query("salons")
      .withIndex("by_username", (q) => q.eq("username", args.token))
      .first();
    
    // Fallback to token lookup if username not found
    if (!salon) {
      salon = await ctx.db
        .query("salons")
        .filter((q) => q.eq(q.field("onboardingToken"), args.token))
        .first();
    }
    
    if (!salon) {
      return null;
    }
    
    // Check if salon has completed onboarding
    const owner = await ctx.db.get(salon.ownerId);
    if (!owner || !owner.onboardingComplete) {
      return null;
    }
    
    // Get pricing configs for the specific style
    const pricingConfigs = await ctx.db
      .query("pricingConfigs")
      .withIndex("by_salonId_and_style", (q) => 
        q.eq("salonId", salon._id).eq("styleName", args.styleName)
      )
      .collect();
    
    if (pricingConfigs.length === 0) {
      return null;
    }
    
    // Get base price and adjustments
    const basePrice = pricingConfigs.find(
      c => c.adjustmentType === "base_price"
    )?.adjustmentValue || 0;
    
    let totalPrice = basePrice;
    let sizeAdjustment = 0;
    let lengthAdjustment = 0;
    let hairTypeAdjustment = 0;
    let curlyHairCost = 0;
    
    // Add size adjustment (if not Jumbo, which is the base)
    if (args.size !== "Jumbo") {
      const sizeConfig = pricingConfigs.find(
        c => c.adjustmentType === "size_adj" && c.adjustmentLabel === args.size
      );
      if (sizeConfig) {
        sizeAdjustment = sizeConfig.adjustmentValue;
        totalPrice += sizeAdjustment;
      }
    }
    
    // Add length adjustment (if not Shoulder-Length, which is the base)
    if (args.length !== "Shoulder-Length") {
      const lengthConfig = pricingConfigs.find(
        c => c.adjustmentType === "length_adj" && c.adjustmentLabel === args.length
      );
      if (lengthConfig) {
        lengthAdjustment = lengthConfig.adjustmentValue;
        totalPrice += lengthAdjustment;
      }
    }
    
    // Add hair type adjustment (if not the standard hair type)
    const standardHairType = salon.standardHairType || "Synthetic";
    if (args.hairType !== standardHairType) {
      const hairTypeConfig = pricingConfigs.find(
        c => c.adjustmentType === "hair_type_adj" && c.adjustmentLabel === args.hairType
      );
      if (hairTypeConfig) {
        hairTypeAdjustment = hairTypeConfig.adjustmentValue;
        totalPrice += hairTypeAdjustment;
      }
    }
    
    // Add curly hair cost if applicable (for Boho Knotless)
    if (args.styleName === "Boho Knotless" && args.includeCurlyHair) {
      const curlyConfig = pricingConfigs.find(
        c => c.adjustmentType === "curly_hair_adj"
      );
      if (curlyConfig) {
        const metadata = curlyConfig.metadata || {};
        if (!metadata.included) {
          // Curly hair is not included in base price, add the cost
          curlyHairCost = curlyConfig.adjustmentValue || 0;
          // Estimate number of packs based on size
          const packMultiplier = {
            "Small": 2,
            "Medium": 3,
            "Large": 4,
            "Jumbo": 5,
            "XL": 6,
          }[args.size] || 3;
          curlyHairCost *= packMultiplier;
          totalPrice += curlyHairCost;
        }
      }
    }
    
    return {
      basePrice,
      sizeAdjustment,
      lengthAdjustment,
      hairTypeAdjustment,
      curlyHairCost,
      totalPrice,
      breakdown: {
        style: args.styleName,
        size: args.size,
        length: args.length,
        hairType: args.hairType,
        includeCurlyHair: args.includeCurlyHair || false,
      },
    };
  },
});