/**
 * Chatbot module for the E-commerce Chatbot
 * Handles chat interactions, message display, product visualization, and session management
 */

class ChatManager {
    constructor() {
        this.isInitialized = false;
        this.messageQueue = [];
        this.isTyping = false;
        this.currentProducts = [];
        this.messageHistory = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutoResize();
        this.setupQuickSuggestions();
        this.loadChatSessions();
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.displayWelcomeMessage();
        this.focusChatInput();
        this.isInitialized = true;
        
        console.log('✅ ChatManager initialized');
    }

    bindEvents() {
        // Chat input handling
        const chatInput = DOMUtils.$('#chat-input');
        const sendBtn = DOMUtils.$('#send-btn');
        
        if (chatInput) {
            chatInput.addEventListener('input', (e) => this.handleInputChange(e));
            chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
            chatInput.addEventListener('paste', (e) => this.handlePaste(e));
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Quick suggestions
        const suggestionBtns = DOMUtils.$$('.suggestion-btn');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.dataset.text;
                if (text) {
                    this.sendQuickMessage(text);
                }
            });
        });

        // Chat controls
        const newChatBtn = DOMUtils.$('#new-chat-btn');
        const clearChatBtn = DOMUtils.$('#clear-chat');
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.startNewChat());
        }
        
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        }

        // Quick action buttons
        const quickActionBtns = DOMUtils.$$('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Product panel
        const closePanelBtn = DOMUtils.$('#close-product-panel');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closeProductPanel());
        }
    }

    setupAutoResize() {
        const chatInput = DOMUtils.$('#chat-input');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                autoResizeTextarea(chatInput);
            });
        }
    }

    setupQuickSuggestions() {
        // Hide suggestions when user starts typing
        const chatInput = DOMUtils.$('#chat-input');
        const suggestions = DOMUtils.$('#quick-suggestions');
        
        if (chatInput && suggestions) {
            chatInput.addEventListener('focus', () => {
                if (chatInput.value.trim() === '') {
                    DOMUtils.show(suggestions, 'flex');
                }
            });
            
            chatInput.addEventListener('input', () => {
                if (chatInput.value.trim() !== '') {
                    DOMUtils.hide(suggestions);
                } else {
                    DOMUtils.show(suggestions, 'flex');
                }
            });
        }
    }

    handleInputChange(e) {
        const input = e.target;
        const sendBtn = DOMUtils.$('#send-btn');
        
        // Enable/disable send button
        if (sendBtn) {
            sendBtn.disabled = input.value.trim() === '';
        }
        
        // Auto-resize textarea
        autoResizeTextarea(input);
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handlePaste(e) {
        // Handle pasted content
        setTimeout(() => {
            const input = e.target;
            autoResizeTextarea(input);
            
            const sendBtn = DOMUtils.$('#send-btn');
            if (sendBtn) {
                sendBtn.disabled = input.value.trim() === '';
            }
        }, 0);
    }

    async sendMessage() {
        const chatInput = DOMUtils.$('#chat-input');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input and reset height
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Disable send button
        const sendBtn = DOMUtils.$('#send-btn');
        if (sendBtn) sendBtn.disabled = true;
        
        // Hide suggestions
        const suggestions = DOMUtils.$('#quick-suggestions');
        if (suggestions) DOMUtils.hide(suggestions);
        
        try {
            // Display user message
            this.displayMessage(message, 'user');
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send to backend
            const response = await this.sendToChatbot(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Display bot response
            this.displayBotResponse(response);
            
            // Update session token
            if (response.session_token) {
                AppState.currentSessionToken = response.session_token;
                AppState.currentSessionId = response.session_id;
                StorageManager.setItem('session_token', response.session_token);
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.displayErrorMessage(error.message);
        }
        
        // Re-enable send button and focus input
        this.focusChatInput();
    }

    sendQuickMessage(text) {
        const chatInput = DOMUtils.$('#chat-input');
        if (chatInput) {
            chatInput.value = text;
            this.sendMessage();
        }
    }

    async sendToChatbot(message) {
        const data = {
            message: message,
            session_token: AppState.currentSessionToken
        };
        
        const response = await ApiClient.post('/chat', data);
        return response;
    }

    displayMessage(content, type) {
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = DOMUtils.createElement('div', `message ${type}`);
        const contentDiv = DOMUtils.createElement('div', 'message-content');
        const timestampDiv = DOMUtils.createElement('div', 'message-timestamp');
        
        // Set content
        if (type === 'user') {
            contentDiv.textContent = content;
        } else {
            contentDiv.innerHTML = this.formatBotMessage(content);
        }
        
        // Set timestamp
        timestampDiv.textContent = FormatUtils.formatTime(new Date().toISOString());
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Add to history
        this.messageHistory.push({
            content,
            type,
            timestamp: new Date().toISOString()
        });
    }

    displayBotResponse(response) {
        const botResponse = response.response;
        
        // Display text message
        this.displayMessage(botResponse.text, 'bot');
        
        // Display products if available
        if (botResponse.products && botResponse.products.length > 0) {
            this.displayProducts(botResponse.products);
            this.currentProducts = botResponse.products;
        }
    }

    displayProducts(products) {
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (!messagesContainer) return;
        
        const productsDiv = DOMUtils.createElement('div', 'message bot');
        const gridDiv = DOMUtils.createElement('div', 'products-grid');
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            gridDiv.appendChild(productCard);
        });
        
        productsDiv.appendChild(gridDiv);
        messagesContainer.appendChild(productsDiv);
        
        this.scrollToBottom();
    }

    createProductCard(product) {
        const card = DOMUtils.createElement('div', 'product-card');
        card.setAttribute('data-product-id', product.id);
        card.setAttribute('tabindex', '0');
        
        // Product image
        const imageDiv = DOMUtils.createElement('div', 'product-image');
        if (product.image_url) {
            const img = DOMUtils.createElement('img');
            img.src = product.image_url;
            img.alt = product.name;
            img.onerror = () => {
                img.style.display = 'none';
                const placeholder = DOMUtils.createElement('div', 'product-image-placeholder');
                placeholder.innerHTML = '📱';
                imageDiv.appendChild(placeholder);
            };
            imageDiv.appendChild(img);
        } else {
            const placeholder = DOMUtils.createElement('div', 'product-image-placeholder');
            placeholder.innerHTML = this.getCategoryIcon(product.category);
            imageDiv.appendChild(placeholder);
        }
        
        // Product info
        const infoDiv = DOMUtils.createElement('div', 'product-info');
        
        // Name
        const nameDiv = DOMUtils.createElement('div', 'product-name', product.name);
        
        // Price
        const priceDiv = DOMUtils.createElement('div', 'product-price');
        const currentPrice = DOMUtils.createElement('span', 'current-price');
        currentPrice.textContent = FormatUtils.formatPrice(product.display_price);
        priceDiv.appendChild(currentPrice);
        
        if (product.is_on_sale && product.price !== product.display_price) {
            const originalPrice = DOMUtils.createElement('span', 'original-price');
            originalPrice.textContent = FormatUtils.formatPrice(product.price);
            priceDiv.appendChild(originalPrice);
            
            const saleBadge = DOMUtils.createElement('span', 'sale-badge', 'SALE');
            priceDiv.appendChild(saleBadge);
        }
        
        // Meta info (rating, stock)
        const metaDiv = DOMUtils.createElement('div', 'product-meta');
        
        const ratingDiv = DOMUtils.createElement('div', 'product-rating');
        const starsDiv = DOMUtils.createElement('div', 'stars');
        starsDiv.innerHTML = FormatUtils.formatRating(product.rating);
        const ratingText = DOMUtils.createElement('span', '', product.rating.toFixed(1));
        ratingDiv.appendChild(starsDiv);
        ratingDiv.appendChild(ratingText);
        
        const stockDiv = DOMUtils.createElement('div', 'product-stock');
        stockDiv.textContent = `${product.stock_quantity} in stock`;
        
        metaDiv.appendChild(ratingDiv);
        metaDiv.appendChild(stockDiv);
        
        // Description
        const descDiv = DOMUtils.createElement('div', 'product-description');
        descDiv.textContent = FormatUtils.truncateText(product.description, 120);
        
        // Assemble card
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(priceDiv);
        infoDiv.appendChild(metaDiv);
        infoDiv.appendChild(descDiv);
        
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        
        // Add click handler
        card.addEventListener('click', () => {
            this.showProductDetails(product);
        });
        
        // Add keyboard handler
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showProductDetails(product);
            }
        });
        
        return card;
    }

    getCategoryIcon(category) {
        const icons = {
            'smartphones': '📱',
            'laptops': '💻',
            'headphones': '🎧',
            'tablets': '📱',
            'smartwatches': '⌚',
            'accessories': '🔌'
        };
        return icons[category] || '📦';
    }

    showProductDetails(product) {
        const panel = DOMUtils.$('#product-panel');
        const content = DOMUtils.$('#product-panel-content');
        
        if (!panel || !content) return;
        
        // Clear previous content
        content.innerHTML = '';
        
        // Create detailed view
        const detailHTML = this.createProductDetailHTML(product);
        content.innerHTML = detailHTML;
        
        // Show panel
        DOMUtils.addClass(panel, 'show');
    }

    createProductDetailHTML(product) {
        return `
            <div class="product-detail-image">
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">` :
                    `<div class="product-image-placeholder">${this.getCategoryIcon(product.category)}</div>`
                }
            </div>
            
            <div class="product-detail-info">
                <h3 class="product-detail-name">${product.name}</h3>
                
                <div class="product-detail-price">
                    <span class="current-price">${FormatUtils.formatPrice(product.display_price)}</span>
                    ${product.is_on_sale && product.price !== product.display_price ? 
                        `<span class="original-price">${FormatUtils.formatPrice(product.price)}</span>
                         <span class="sale-badge">SALE</span>` : ''
                    }
                </div>
                
                <div class="product-rating">
                    <div class="stars">${FormatUtils.formatRating(product.rating)}</div>
                    <span>${product.rating.toFixed(1)} / 5.0</span>
                </div>
                
                <p class="product-detail-description">${product.description}</p>
            </div>
            
            <div class="product-specs">
                <h4>Product Details</h4>
                <div class="spec-item">
                    <span class="spec-label">Brand</span>
                    <span class="spec-value">${product.brand}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Category</span>
                    <span class="spec-value">${product.category}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Stock</span>
                    <span class="spec-value">${product.stock_quantity} available</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Rating</span>
                    <span class="spec-value">${product.rating}/5.0</span>
                </div>
                ${product.is_featured ? 
                    `<div class="spec-item">
                        <span class="spec-label">Featured</span>
                        <span class="spec-value">✨ Yes</span>
                    </div>` : ''
                }
            </div>
        `;
    }

    closeProductPanel() {
        const panel = DOMUtils.$('#product-panel');
        if (panel) {
            DOMUtils.removeClass(panel, 'show');
        }
    }

    formatBotMessage(text) {
        // Convert markdown-like formatting to HTML
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<s>$1</s>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    displayErrorMessage(errorText) {
        const errorMessage = `Sorry, I encountered an error: ${errorText}. Please try again.`;
        this.displayMessage(errorMessage, 'bot');
    }

    displayWelcomeMessage() {
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        const welcomeDiv = DOMUtils.createElement('div', 'welcome-message');
        welcomeDiv.innerHTML = `
            <div class="bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <h3>Welcome to ShopBot!</h3>
            <p>I'm your personal shopping assistant. I can help you find products, compare prices, and answer questions about our inventory.</p>
            <p>Try asking me something like:</p>
            <ul style="text-align: left; margin-top: 1rem;">
                <li>"Show me smartphones under $500"</li>
                <li>"I need a laptop for gaming"</li>
                <li>"What headphones do you recommend?"</li>
            </ul>
        `;
        
        messagesContainer.appendChild(welcomeDiv);
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingIndicator = DOMUtils.$('#typing-indicator');
        if (typingIndicator) {
            DOMUtils.show(typingIndicator, 'flex');
        }
        
        // Add typing message to chat
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (messagesContainer) {
            const loadingDiv = DOMUtils.createElement('div', 'message bot');
            loadingDiv.id = 'typing-message';
            
            const loadingContent = DOMUtils.createElement('div', 'message-loading');
            loadingContent.innerHTML = `
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <span>ShopBot is typing...</span>
            `;
            
            loadingDiv.appendChild(loadingContent);
            messagesContainer.appendChild(loadingDiv);
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = DOMUtils.$('#typing-indicator');
        if (typingIndicator) {
            DOMUtils.hide(typingIndicator);
        }
        
        // Remove typing message
        const typingMessage = DOMUtils.$('#typing-message');
        if (typingMessage) {
            DOMUtils.removeElement(typingMessage);
        }
    }

    scrollToBottom() {
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    focusChatInput() {
        const chatInput = DOMUtils.$('#chat-input');
        if (chatInput) {
            chatInput.focus();
            
            // Enable send button if there's content
            const sendBtn = DOMUtils.$('#send-btn');
            if (sendBtn) {
                sendBtn.disabled = chatInput.value.trim() === '';
            }
        }
    }

    async startNewChat() {
        try {
            const response = await ApiClient.post('/chat/reset');
            
            AppState.currentSessionToken = response.session_token;
            StorageManager.setItem('session_token', response.session_token);
            
            this.messageHistory = [];
            this.currentProducts = [];
            this.displayWelcomeMessage();
            this.focusChatInput();
            
            ToastManager.success('New chat session started');
            
            // Refresh sessions list
            this.loadChatSessions();
            
        } catch (error) {
            console.error('Failed to start new chat:', error);
            ToastManager.error('Failed to start new chat');
        }
    }

    clearCurrentChat() {
        this.messageHistory = [];
        this.currentProducts = [];
        this.displayWelcomeMessage();
        this.focusChatInput();
        ToastManager.success('Chat cleared');
    }

    async loadChatSessions() {
        if (!AppState.isAuthenticated) return;
        
        try {
            const response = await ApiClient.get('/chat/sessions');
            this.displayChatSessions(response.sessions);
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        }
    }

    displayChatSessions(sessions) {
        const sessionsList = DOMUtils.$('#sessions-list');
        if (!sessionsList) return;
        
        sessionsList.innerHTML = '';
        
        if (sessions.length === 0) {
            const emptyDiv = DOMUtils.createElement('div', 'text-center');
            emptyDiv.innerHTML = '<p style="color: var(--text-muted); font-size: var(--font-size-sm);">No previous sessions</p>';
            sessionsList.appendChild(emptyDiv);
            return;
        }
        
        sessions.forEach(session => {
            const sessionDiv = this.createSessionItem(session);
            sessionsList.appendChild(sessionDiv);
        });
    }

    createSessionItem(session) {
        const sessionDiv = DOMUtils.createElement('div', 'session-item');
        sessionDiv.setAttribute('data-session-token', session.session_token);
        
        const titleDiv = DOMUtils.createElement('div', 'session-title');
        titleDiv.textContent = `Chat Session ${session.id}`;
        
        const metaDiv = DOMUtils.createElement('div', 'session-meta');
        const timeSpan = DOMUtils.createElement('span', 'session-time');
        timeSpan.textContent = FormatUtils.formatDateTime(session.updated_at);
        
        const countSpan = DOMUtils.createElement('span', 'message-count');
        countSpan.textContent = session.message_count || 0;
        
        metaDiv.appendChild(timeSpan);
        metaDiv.appendChild(countSpan);
        
        sessionDiv.appendChild(titleDiv);
        sessionDiv.appendChild(metaDiv);
        
        // Add click handler
        sessionDiv.addEventListener('click', () => {
            this.loadChatSession(session.session_token);
        });
        
        return sessionDiv;
    }

    async loadChatSession(sessionToken) {
        try {
            const response = await ApiClient.get('/chat/history', {
                session_token: sessionToken
            });
            
            AppState.currentSessionToken = sessionToken;
            StorageManager.setItem('session_token', sessionToken);
            
            this.displayChatHistory(response.messages);
            this.focusChatInput();
            
            // Update active session UI
            this.updateActiveSession(sessionToken);
            
        } catch (error) {
            console.error('Failed to load chat session:', error);
            ToastManager.error('Failed to load chat session');
        }
    }

    displayChatHistory(messages) {
        const messagesContainer = DOMUtils.$('#chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            this.displayWelcomeMessage();
            return;
        }
        
        messages.forEach(message => {
            this.displayMessage(message.content, message.message_type);
        });
    }

    updateActiveSession(sessionToken) {
        const sessionItems = DOMUtils.$$('.session-item');
        sessionItems.forEach(item => {
            DOMUtils.removeClass(item, 'active');
            if (item.dataset.sessionToken === sessionToken) {
                DOMUtils.addClass(item, 'active');
            }
        });
    }

    async handleQuickAction(action) {
        const actions = {
            'categories': 'Show me all product categories',
            'deals': 'Show me products on sale',
            'featured': 'Show me featured products'
        };
        
        const message = actions[action];
        if (message) {
            const chatInput = DOMUtils.$('#chat-input');
            if (chatInput) {
                chatInput.value = message;
                await this.sendMessage();
            }
        }
    }

    // Export chat functionality
    async exportChatHistory() {
        if (this.messageHistory.length === 0) {
            ToastManager.error('No chat history to export');
            return;
        }
        
        const exportData = {
            timestamp: new Date().toISOString(),
            user: AppState.currentUser?.username || 'Anonymous',
            session_token: AppState.currentSessionToken,
            messages: this.messageHistory
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ToastManager.success('Chat history exported');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ChatManager) {
        window.ChatManager = ChatManager;
    }
});

// Export for global access
window.ChatManager = ChatManager; 