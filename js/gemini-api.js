/**
 * gemini-api.js
 * Handles communication with the Google Gemini API
 */

class GeminiAPI {
    constructor() {
        this.baseUrl = "/api/chat";
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
          4. He is a world-class gamer, ranked Top 100 in the COD World Championship 2025!
        
        Instructions:
        - Answer questions about Vihaan in a super fun, energetic, and kid-friendly way.
        - If asked about his ambition, talk about his dream to build rockets.
        - Keep responses short (under 3 sentences) and use emojis!`;
    }

    async sendMessage(history, userMessage) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    history: history,
                    userMessage: userMessage,
                    systemPrompt: this.systemPrompt
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
            console.error("Gemini API Proxy Error:", error);

            // Check if it's likely a connection error (server offline)
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                return "🚨 I can't connect to my server! Please make sure you've run 'npm start' in your terminal and you are opening http://localhost:3000.";
            }

            return "Oops! My brain is clouding over. Please check your internet or API key.";
        }
    }
}
