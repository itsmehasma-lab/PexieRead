import { GoogleGenAI, Part, Type, Chat, GenerateContentResponse } from "@google/genai";
// Fix: Added .ts extension to fix module resolution error.
import type { ChatMessage, AnalysisResult } from '../types.ts';

// Fix: Initialize GoogleGenAI with a named apiKey parameter as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (imageFile: File) => {
  const imagePart = await fileToGenerativePart(imageFile);

  // Fix: Use a recommended model for the task.
  const model = 'gemini-2.5-flash';
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [
        {
          parts: [
            {
              text: `You are an expert text extractor, linguist, and classifier.
Your task is to extract all text from the provided image.
When extracting the text, please perform the following actions:
1.  **Correct Spelling:** Fix any spelling errors you find.
2.  **Format Text:** Preserve the original formatting, such as line breaks and spacing, to ensure readability.
3.  **Detect Language:** Identify the primary language of the extracted text (e.g., 'English', 'Spanish').

After extracting and cleaning the text, classify the result into one of the following categories:

- "Digits only": If the text consists exclusively of numerical digits (0-9). Associated formatting like spaces, commas, periods, hyphens, or currency symbols ($) are allowed.
  - Example 1: "123 456 7890"
  - Example 2: "$1,234.56"
  - Example 3: "2024-07-26"

- "Alphabets only": If the text consists exclusively of alphabetic characters (a-z, A-Z). Punctuation, symbols (like /), and spacing are allowed.
  - Example 1: "Hello World!"
  - Example 2: "This is a sample sentence."
  - Example 3: "OPEN/CLOSED"

- "Alphanumeric": If the text contains a mix of both alphabetic characters and numerical digits.
  - Example 1: "License Plate ABC 123"
  - Example 2: "Order #A4B8C1"
  - Example 3: "Expires on 08/25"`
            },
            imagePart,
          ],
        },
    ],
    // Fix: Use responseSchema for reliable JSON output as per guidelines.
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                category: {
                    type: Type.STRING,
                    description: "The classification of the extracted text. Must be one of: 'Digits only', 'Alphabets only', or 'Alphanumeric'."
                },
                extractedText: {
                    type: Type.STRING,
                    description: "All the text extracted from the image, corrected for spelling and preserving original formatting."
                },
                language: {
                    type: Type.STRING,
                    description: "The detected language of the extracted text (e.g., 'English', 'Spanish', 'French')."
                }
            },
            required: ["category", "extractedText", "language"]
        }
    }
  });

  // Fix: Access response text directly via the .text property.
  const text = response.text;
  try {
    const result = JSON.parse(text);

    if (typeof result.category === 'string' && typeof result.extractedText === 'string' && typeof result.language === 'string') {
        return { ...result, rawResponse: text };
    } else {
        throw new Error("Invalid JSON structure from API");
    }

  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    // Fallback if parsing fails
    return {
        category: "Uncategorized",
        extractedText: "Could not analyze the image.",
        language: "Unknown",
        rawResponse: text,
    };
  }
};


let chat: Chat | null = null;

export const startChatSession = (analysis: Pick<AnalysisResult, 'category' | 'extractedText' | 'language'>) => {
    // Fix: Use a recommended model for the task.
    const model = 'gemini-2.5-flash';
    chat = ai.chats.create({
        model,
        config: {
            systemInstruction: `You are a helpful assistant. The user has just uploaded an image, and the following text was extracted from it:\n\n---\n${analysis.extractedText}\n---\n\nThe text has been classified as: "${analysis.category}" and is in ${analysis.language}. Your task is to answer follow-up questions about this text and image. Be concise and helpful.`
        }
    });
};

export const sendChatMessage = async (message: string): Promise<string> => {
    if (!chat) {
        throw new Error("Chat not initialized. Call startChatSession first.");
    }
    const response = await chat.sendMessage({ message });
    // Fix: Access response text directly via the .text property.
    return response.text;
};