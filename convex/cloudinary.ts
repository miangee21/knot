//convex/cloudinary.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate signature for direct frontend upload
export const generateUploadSignature = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const timestamp = Math.round(new Date().getTime() / 1000);

    // We enforce the 'knot' folder structure here
    const folder = "knot/items";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      timestamp,
      folder,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  },
});

// Delete image from Cloudinary
export const deleteImage = action({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    try {
      // Deletes the image permanently from Cloudinary bucket
      await cloudinary.uploader.destroy(args.publicId);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
      throw new Error("Failed to delete image");
    }
  },
});
