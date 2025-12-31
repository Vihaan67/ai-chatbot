const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files (HTML, CSS, JS, Images) from the current directory
app.use(express.static(__dirname));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Server test endpoint
app.get('/server-test', (req, res) => {
    res.send('<h1>Server is alive and responding!</h1>');
});

// Debug environment endpoint (Safe check)
app.get('/debug-env', (req, res) => {
    res.json({
        has_key: !!process.env.GEMINI_API_KEY,
        key_exists: "GEMINI_API_KEY" in process.env,
        node_env: process.env.NODE_ENV || 'not set',
        port: PORT
    });
});

// Proxy endpoint for Gemini API
app.post('/api/chat', async (req, res) => {
    console.log("Chat request received:", JSON.stringify(req.body || {}).substring(0, 100));

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Empty request body" });
    }
    try {
        const { history, userMessage, systemPrompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY environment variable");
            return res.status(500).json({ error: "API Key not configured on server" });
        }

        const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
        const url = `${baseUrl}?key=${apiKey}`;

        const contents = history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: `(Context: ${systemPrompt}) ${userMessage}` }]
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Non-JSON response received from Gemini:", text.substring(0, 500));
            return res.status(502).json({ error: "Invalid response from Gemini API", details: text.substring(0, 100) });
        }

        if (!response.ok) {
            console.error("Gemini API Error:", JSON.stringify(data));
            return res.status(response.status).json({ error: "Gemini API failed", details: data });
        }

        res.json(data);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

// For any other GET request, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
