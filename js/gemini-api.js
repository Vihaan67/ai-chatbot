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
                const errorData = await response.json().catch(() => ({}));
                console.error("Server Error Response:", errorData);

                if (response.status === 500) {
                    return "⚙️ Server configuration issue: The API Key might be missing or incorrect. Please check your .env file.";
                }
                if (response.status === 429) {
                    return "🚀 I'm a bit overwhelmed with requests right now! Please wait a minute and try asking again.";
                }
                if (response.status === 502) {
                    return "🛰️ I'm having trouble connecting to my AI brain (Gemini API). It might be temporarily down.";
                }

                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "🤔 I received an empty response. Could you try rephrasing your question?";
            }

        } catch (error) {
            console.error("Gemini API Proxy Error:", error);

            // Check if it's likely a connection error (server offline)
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                return "🚨 Network Error: I'm having trouble connecting to my brain! Please check your internet connection and try refreshing the page.";
            }

            console.error("Specific error caught:", error.message);
            return "🌪️ Something went wrong on my end. Please try refreshing the page or checking your internet connection. If the issue persists, the AI might be busy, so please try again in a moment!";
        }
    }
}
