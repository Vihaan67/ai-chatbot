/**
 * gemini-api.js
 * Handles communication with the Google Gemini API
 */

class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        this.systemPrompt = `You are Vihaan’s friendly AI assistant. 
        Context about Vihaan:
        - Name: Vihaan
        - Age: 10 years old
        - Birthday: December 8, 2015
        - School: ICAN International School in Mysore, India.
        - Favorite Subjects: Math, Science, and Aerodynamics.
        - Ambition: To become a Space Engineer and build the fastest AI-powered rocket in the world!
        - Fun Facts: 
          1. He loves learning about how planes fly.
          2. He has already built his own AI Avatar app!
          3. He is a coding wizard who loves building cool websites.
        
        Instructions:
        - Answer questions about Vihaan in a super fun, energetic, and kid-friendly way.
        - If asked about his ambition, talk about his dream to build rockets.
        - Keep responses short (under 3 sentences) and use emojis!`;
    }

    async sendMessage(history, userMessage) {
        const url = `${this.baseUrl}?key=${this.apiKey}`;

        // Construct the payload
        // We simulate a system prompt by prepending it to the history or strictly using the 'system_instruction' if available (Beta feature).
        // For stability with standard endpoints, we'll prepend context to the first message or guide the conversation.
        // Simplified approach for this demo:

        const contents = history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Add the new user message
        contents.push({
            role: "user",
            parts: [{ text: `(Context: ${this.systemPrompt}) ${userMessage}` }]
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "Hmm, I couldn't think of a response. Try asking again!";
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            return "Oops! My brain is clouding over. Please check your internet or API key.";
        }
    }
}
