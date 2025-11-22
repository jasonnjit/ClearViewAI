import { GoogleGenAI } from "@google/genai";

// Initialize the client with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Removes watermarks from an image using Gemini's image editing capabilities.
 * 
 * @param base64Image The base64 string of the image (excluding the data:image/xyz;base64, prefix)
 * @param mimeType The mime type of the image (e.g., image/jpeg)
 * @returns The base64 string of the processed image
 */
export const removeWatermark = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Remove all watermarks, text overlays, logos, and copyright stamps from this image. Reconstruct the background seamlessly where the watermarks were removed. Return ONLY the cleaned image.',
          },
        ],
      },
    });

    // Extract the image from the response
    let processedImageBase64 = '';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          processedImageBase64 = part.inlineData.data;
          break; // Found the image
        }
      }
    }

    if (!processedImageBase64) {
      throw new Error("The model did not return an image. It might have refused the request or returned text only.");
    }

    return processedImageBase64;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image with Gemini.");
  }
};
