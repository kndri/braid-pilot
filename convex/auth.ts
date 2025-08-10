import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      id: "password",
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Check if user exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.profile.email))
        .first();

      if (existingUser) {
        // Update existing user
        await ctx.db.patch(existingUser._id, {
          updatedAt: Date.now(),
        });
        return existingUser._id;
      }

      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.profile.email!,
        name: args.profile.name || "",
        emailVerified: args.profile.emailVerified || false,
        image: args.profile.image || null,
        onboardingComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return userId;
    },
    async redirect({ redirectTo }) {
      return redirectTo ?? "/dashboard";
    },
  },
});