/**
 * chatbot.js
 * Handles UI interactions and orchestrates the chatbot logic
 */

const CHAT_HTML = `
    <!-- Floating Action Button -->
    <button id="chat-fab" class="chat-fab pulse" aria-label="Open Chat" data-tooltip="Chat with my AI assistant!">
        <span class="material-symbols-rounded">chat_bubble</span>
        <span id="chat-badge" class="chat-badge">1</span>
    </button>

    <!-- Chat Window -->
    <div id="chat-window" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
            <div class="chat-title">
                <span class="material-symbols-rounded">smart_toy</span>
                <span>Vihaan's AI Buddy</span>
            </div>
            <div class="chat-controls">
                <button id="close-chat" aria-label="Close Chat">
                    <span class="material-symbols-rounded">close</span>
                </button>
            </div>
        </div>

        <!-- Messages Area -->
        <div id="chat-messages" class="chat-messages">
            <!-- Messages will be injected here -->
        </div>

        <!-- Quick Replies -->
         <div class="chat-input-area">
             <div id="quick-replies" class="quick-replies">
                <button class="quick-reply-btn" data-msg="What is Vihaan's dream?">Dream?</button>
                <button class="quick-reply-btn" data-msg="Where does he go to school?">School?</button>
                <button class="quick-reply-btn" data-msg="Tell me a fun fact!">Fun Fact!</button>
            </div>
            <div class="input-wrapper">
                <input type="text" id="chat-input" placeholder="Ask me anything..." autocomplete="off">
                <button id="send-btn">
                    <span class="material-symbols-rounded">send</span>
                </button>
            </div>
        </div>
    </div>
`;

class Chatbot {
    constructor() {
        this.container = document.getElementById('chatbot-container');
        this.history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        this.isOpen = false;
        this.api = new GeminiAPI();

        this.init();
    }

    init() {
        // Inject HTML
        this.container.innerHTML = CHAT_HTML;

        // Elements
        this.fab = document.getElementById('chat-fab');
        this.badge = document.getElementById('chat-badge');
        this.window = document.getElementById('chat-window');
        this.closeBtn = document.getElementById('close-chat');
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.quickReplies = document.querySelectorAll('.quick-reply-btn');

        // Add Listeners
        this.addEventListeners();

        // Load History
        this.renderHistory();

        // Show welcome if empty
        if (this.history.length === 0) {
            this.addMessage('ai', "Hi! I'm Vihaan's AI Buddy. Ask me anything about him!");
        }
    }


    addEventListeners() {
        this.fab.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());

        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        this.quickReplies.forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.getAttribute('data-msg');
                this.handleUserMessage(msg);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('open');
            this.fab.style.transform = 'scale(0)'; // Hide FAB
            this.toggleBadge(false); // Hide badge when opened
            // Focus input
            setTimeout(() => this.input.focus(), 300);
        } else {
            this.window.classList.remove('open');
            this.fab.style.transform = 'scale(1)'; // Show FAB
        }
    }

    toggleBadge(show) {
        if (show) {
            this.badge.classList.add('visible');
        } else {
            this.badge.classList.remove('visible');
        }
    }

    renderHistory() {
        this.messagesContainer.innerHTML = '';
        this.history.forEach(msg => {
            this.renderMessageElement(msg.role, msg.text, msg.timestamp);
        });
        this.scrollToBottom();
    }

    addMessage(role, text) {
        const msg = {
            role,
            text,
            timestamp: new Date().toISOString()
        };
        this.history.push(msg);
        localStorage.setItem('chatHistory', JSON.stringify(this.history));
        this.renderMessageElement(role, text, msg.timestamp);
        this.scrollToBottom();

        if (!this.isOpen && role === 'ai') {
            this.toggleBadge(true);
        }
    }

    renderMessageElement(role, text, timestamp) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.innerHTML = `
            <div class="content">${text}</div>
            <span class="timestamp">${new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        this.messagesContainer.appendChild(div);
    }

    showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        await this.handleUserMessage(text);
    }

    async handleUserMessage(text) {
        this.addMessage('user', text);

        if (!this.api) {
            this.addMessage('ai', "I need an API key to think! Please refresh and provide one.");
            return;
        }

        this.showTypingIndicator();

        // Call API
        // Filter history to last 10 messages to save context limits
        const recentHistory = this.history.slice(-10);
        const response = await this.api.sendMessage(recentHistory, text);

        this.hideTypingIndicator();
        this.addMessage('ai', response);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chatbot();
});
