import { GoogleGenAI, Type } from "@google/genai";
import { CinematicAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_TEXT = `
אתה מומחה לקולנוע, במאי ועורך וידאו בעל שם עולמי.
תפקידך הוא לנתח ניתוח מעמיק המתמקד ב"מבע קולנועי" (Cinematic Expression).
עליך לזהות ולהסביר את המרכיבים הבאים:
1. סוגי שוטים (Shot Types) - לונג שוט, קלוז אפ וכו'.
2. זוויות צילום (Camera Angles).
3. תנועות מצלמה (Camera Movement).
4. תאורה וצבע (Lighting & Color).
5. פסקול וסאונד (Sound Design) - דיאגטי/לא דיאגטי.
6. עריכה ומקצב (Editing & Pacing).
7. סמליות ומשמעות (Symbolism).

התשובה חייבת להיות בעברית מלאה, מקצועית ומעשירה.
`;

const RESPONSE_SCHEMA_OBJ = {
  type: Type.OBJECT,
  properties: {
    synopsis: { type: Type.STRING, description: "תקציר קצר של מה רואים בסרטון" },
    emotional_tone: { type: Type.STRING, description: "הטון הרגשי המרכזי" },
    visual_style: {
      type: Type.OBJECT,
      properties: {
        shot_types: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timecode: { type: Type.STRING, description: "זמן משוער בסרטון אם רלוונטי" }
            }
          }
        },
        camera_angles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timecode: { type: Type.STRING }
            }
          }
        },
        camera_movement: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timecode: { type: Type.STRING }
            }
          }
        },
        lighting: { type: Type.STRING, description: "ניתוח התאורה (High Key, Low Key, וכו')" },
        color_palette: { type: Type.STRING, description: "ניתוח הצבעים הדומיננטיים והמשמעות שלהם" }
      }
    },
    audio_design: {
      type: Type.OBJECT,
      properties: {
        music: { type: Type.STRING },
        sound_effects: { type: Type.STRING },
        dialogue: { type: Type.STRING }
      }
    },
    editing: {
      type: Type.OBJECT,
      properties: {
        pacing: { type: Type.STRING, description: "קצב העריכה (מהיר, איטי, קצבי)" },
        transitions: { type: Type.STRING }
      }
    },
    symbolism: { type: Type.STRING, description: "ניתוח משמעויות נסתרות או סמלים ויזואליים" },
    verdict: { type: Type.STRING, description: "סיכום כללי של איכות המבע הקולנועי בסרטון" }
  },
  required: ["synopsis", "visual_style", "audio_design", "editing", "verdict"]
};

// For YouTube (where responseSchema is not allowed with tools), we explicitly ask for JSON in the prompt.
const JSON_FORMAT_PROMPT = `
אנא ספק את הפלט בפורמט JSON בלבד (ללא Markdown), התואם למבנה הבא:
{
  "synopsis": "string",
  "emotional_tone": "string",
  "visual_style": {
    "shot_types": [{"title": "string", "description": "string", "timecode": "string"}],
    "camera_angles": [{"title": "string", "description": "string", "timecode": "string"}],
    "camera_movement": [{"title": "string", "description": "string", "timecode": "string"}],
    "lighting": "string",
    "color_palette": "string"
  },
  "audio_design": {
    "music": "string",
    "sound_effects": "string",
    "dialogue": "string"
  },
  "editing": {
    "pacing": "string",
    "transitions": "string"
  },
  "symbolism": "string",
  "verdict": "string"
}
`;

export const analyzeVideoContent = async (base64Data: string, mimeType: string): Promise<CinematicAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "נתח את הסרטון הזה לפי עקרונות המבע הקולנועי. ספק פלט בפורמט JSON בעברית."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TEXT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA_OBJ
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    return JSON.parse(text) as CinematicAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const analyzeYoutubeVideo = async (url: string): Promise<CinematicAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: `${SYSTEM_INSTRUCTION_TEXT}
          
          אנא נתח את הסרטון בקישור הבא: ${url}
          השתמש בכלי החיפוש כדי למצוא מידע על הסרטון (ניתוח שוטים, תאורה, משמעות וכו') ונתח אותו על סמך המידע שתמצא.
          
          ${JSON_FORMAT_PROMPT}`
        }]
      },
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be used with tools
      }
    });

    let text = response.text || "{}";
    // Clean potential Markdown formatting (```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let analysis: CinematicAnalysis;
    try {
      analysis = JSON.parse(text) as CinematicAnalysis;
    } catch (e) {
      console.error("Failed to parse JSON from YouTube analysis:", text);
      throw new Error("Failed to parse analysis results.");
    }

    // Extract sources from grounding metadata
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources: { title: string; uri: string }[] = [];
      
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      }
      
      // Deduplicate sources by URI
      const uniqueSourcesMap = new Map<string, { title: string; uri: string }>();
      for (const source of sources) {
        uniqueSourcesMap.set(source.uri, source);
      }
      analysis.sources = Array.from(uniqueSourcesMap.values());
    }

    return analysis;

  } catch (error) {
    console.error("Gemini YouTube Analysis Error:", error);
    throw error;
  }
};
