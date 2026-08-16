//src/features/items/utils/cloudinary.ts
export async function uploadImageToCloudinary(
  file: File,
  generateSignatureMutation: () => Promise<any>,
): Promise<{ url: string; publicId: string }> {
  try {
    // 1. Get Secure Signature from Convex
    const { signature, timestamp, folder, apiKey, cloudName } =
      await generateSignatureMutation();

    // 2. Prepare Form Data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    // 3. Upload File Directly
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
}
