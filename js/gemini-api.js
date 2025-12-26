/**
 * gemini-api.js
 * Handles communication with the Google Gemini API
 */

class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
        this.systemPrompt = "You are Vihaan’s friendly AI assistant. You know all about Vihaan - their hobbies, goals, and fun facts. Answer questions about Vihaan in a fun, friendly way. Keep responses short and kid-friendly. Context: Vihaan is a student who loves coding, AI, and building apps. His favorite color is blue. He has built an AI Avatar app.";
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
