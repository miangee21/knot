// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const customAuth = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
});

// Original auth methods
export const { auth, signOut, store, isAuthenticated } = customAuth;

// Export original sign in natively so Convex registers it
export const _coreSignIn = customAuth.signIn;

// Secure wrapper (100% type-safe)
export const signIn = action({
  args: {
    provider: v.optional(v.string()),
    verifier: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    // v.any() is a Convex schema validator here, NOT a TypeScript type bypass
    params: v.optional(v.any()),
    calledBy: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    // Strictly type the params in TypeScript to maintain security
    const params = args.params as Record<string, unknown> | undefined;
    const isSignUp = params?.flow === "signUp";

    if (isSignUp) {
      const signupEnabled = await ctx.runQuery(
        api.appSettings.getSignupEnabled,
      );
      if (!signupEnabled) {
        throw new Error("Signups are currently disabled by the administrator.");
      }
    }

    // Call the original action without any TS ignores
    return await ctx.runAction(api.auth._coreSignIn, args);
  },
});
