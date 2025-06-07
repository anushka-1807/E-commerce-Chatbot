/**
 * Main application controller for the E-commerce Chatbot
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing E-commerce Chatbot App...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                await this.initializeApp();
            }
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeApp() {
        try {
            // Initialize core modules
            await this.initializeModules();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Initialize UI components
            this.initializeUIComponents();
            
            this.isInitialized = true;
            console.log('✅ App initialized successfully');
            
            // Dispatch app ready event
            this.dispatchAppReadyEvent();
            
        } catch (error) {
            console.error('❌ App module initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeModules() {
        console.log('📦 Initializing modules...');
        
        // Wait for auth manager to be ready
        if (window.authManager) {
            this.modules.auth = window.authManager;
        }
        
        // Initialize chat manager when it's available
        if (window.ChatManager) {
            this.modules.chat = new window.ChatManager();
        }
        
        console.log('✅ Modules initialized');
    }

    setupGlobalEventListeners() {
        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Handle online/offline status
        window.addEventListener('online', () => {
            ToastManager.success('Connection restored');
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            ToastManager.error('Connection lost');
            this.handleOnlineStatus(false);
        });

        // Handle visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle before unload (page refresh/close)
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusChatInput();
                        break;
                    case '/':
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                }
            }

            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    }

    initializeUIComponents() {
        // Initialize sidebar toggle
        this.initializeSidebarToggle();
        
        // Initialize mobile responsive behavior
        this.initializeMobileResponsive();
        
        // Initialize accessibility features
        this.initializeAccessibility();
        
        // Initialize theme system (if implemented)
        this.initializeTheme();
    }

    initializeSidebarToggle() {
        const toggleBtn = DOMUtils.$('#toggle-sidebar');
        const sidebar = DOMUtils.$('.chat-sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                DOMUtils.toggleClass(sidebar, 'show');
            });
        }
    }

    initializeMobileResponsive() {
        // Handle mobile menu behavior
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobileChange = (e) => {
            const sidebar = DOMUtils.$('.chat-sidebar');
            
            if (e.matches) {
                // Mobile mode
                this.enableMobileMode();
            } else {
                // Desktop mode
                this.disableMobileMode();
                if (sidebar) DOMUtils.removeClass(sidebar, 'show');
            }
        };

        mediaQuery.addListener(handleMobileChange);
        handleMobileChange(mediaQuery); // Initial check
    }

    initializeAccessibility() {
        // Add focus management
        this.setupFocusManagement();
        
        // Add ARIA labels where needed
        this.setupAriaLabels();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    initializeTheme() {
        // Check for saved theme preference or default to 'light'
        const savedTheme = StorageManager.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setupFocusManagement() {
        // Trap focus in modals
        const modals = DOMUtils.$$('.modal');
        modals.forEach(modal => {
            this.setupFocusTrap(modal);
        });
    }

    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    setupAriaLabels() {
        // Add missing ARIA labels
        const buttons = DOMUtils.$$('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const iconClass = button.querySelector('i')?.className;
                if (iconClass) {
                    // Derive label from icon class
                    const label = this.getAriaLabelFromIcon(iconClass);
                    if (label) button.setAttribute('aria-label', label);
                }
            }
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard navigation for custom components
        const productCards = DOMUtils.$$('.product-card');
        productCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    getAriaLabelFromIcon(iconClass) {
        const iconMap = {
            'fa-bars': 'Toggle menu',
            'fa-times': 'Close',
            'fa-search': 'Search',
            'fa-user': 'User profile',
            'fa-sign-out-alt': 'Logout',
            'fa-paper-plane': 'Send message',
            'fa-trash': 'Delete',
            'fa-plus': 'Add new'
        };

        for (const [icon, label] of Object.entries(iconMap)) {
            if (iconClass.includes(icon)) {
                return label;
            }
        }
        return null;
    }

    // Event Handlers
    handleWindowResize() {
        // Handle responsive behavior on resize
        this.updateViewportHeight();
    }

    handleOnlineStatus(isOnline) {
        // Update UI based on connection status
        const statusElements = DOMUtils.$$('.connection-status');
        statusElements.forEach(element => {
            element.textContent = isOnline ? 'Online' : 'Offline';
            element.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden (user switched tabs)
            this.onPageHidden();
        } else {
            // Page is visible again
            this.onPageVisible();
        }
    }

    handleBeforeUnload(e) {
        // Check if there are unsaved changes
        if (this.hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    }

    handleGlobalError(error) {
        console.error('Global error handled:', error);
        
        // Don't show toast for network errors (handled by ApiClient)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return;
        }
        
        // Show user-friendly error message
        ToastManager.error('Something went wrong. Please try again.');
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show fallback UI
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; font-family: Arial, sans-serif;">
                <div>
                    <h1>🔧 Something went wrong</h1>
                    <p>The app failed to initialize. Please refresh the page.</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }

    handleEscapeKey() {
        // Close any open modals or panels
        const openModal = DOMUtils.$('.modal.show');
        if (openModal) {
            ModalManager.hide(openModal.id);
            return;
        }

        const productPanel = DOMUtils.$('#product-panel.show');
        if (productPanel) {
            DOMUtils.removeClass(productPanel, 'show');
            return;
        }

        // Close mobile sidebar
        const sidebar = DOMUtils.$('.chat-sidebar.show');
        if (sidebar && window.innerWidth <= 768) {
            DOMUtils.removeClass(sidebar, 'show');
        }
    }

    // Utility Methods
    focusChatInput() {
        const chatInput = DOMUtils.$('#chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    }

    showKeyboardShortcuts() {
        ToastManager.success('Ctrl+K: Focus chat input | Ctrl+/: Show shortcuts | Esc: Close');
    }

    updateViewportHeight() {
        // Update CSS custom property for mobile viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    enableMobileMode() {
        document.body.classList.add('mobile-mode');
    }

    disableMobileMode() {
        document.body.classList.remove('mobile-mode');
    }

    onPageHidden() {
        // Pause any ongoing operations
        console.log('Page hidden');
    }

    onPageVisible() {
        // Resume operations
        console.log('Page visible');
    }

    hasUnsavedChanges() {
        // Check for unsaved chat messages or other state
        return false; // Implement based on needs
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        StorageManager.setItem('theme', theme);
    }

    dispatchAppReadyEvent() {
        const event = new CustomEvent('appReady', {
            detail: { app: this }
        });
        document.dispatchEvent(event);
    }

    // Public API
    getModule(name) {
        return this.modules[name];
    }

    isReady() {
        return this.isInitialized;
    }

    // Health Check
    async healthCheck() {
        try {
            const response = await ApiClient.get('/health');
            console.log('Backend health:', response);
            return response.status === 'healthy';
        } catch (error) {
            console.error('Backend health check failed:', error);
            return false;
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    static init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`📊 Page load time: ${loadTime}ms`);
            }, 0);
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                console.log(`💾 Memory usage: ${Math.round(memory.usedJSHeapSize / 1048576)}MB`);
            }, 30000); // Every 30 seconds
        }
    }
}

// Development helpers
class DevHelpers {
    static init() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Add development helpers
            window.app = app;
            window.debug = {
                state: AppState,
                toast: ToastManager,
                api: ApiClient,
                storage: StorageManager,
                clearState: clearAppState
            };
            
            console.log('🔧 Development mode enabled');
            console.log('Available debug tools: window.debug');
        }
    }
}

// Initialize the application
const app = new App();

// Initialize performance monitoring
PerformanceMonitor.init();

// Initialize development helpers
DevHelpers.init();

// Global error recovery
window.addEventListener('error', (e) => {
    if (e.message.includes('Script error')) {
        console.log('CORS script error - likely from external resources');
        return;
    }
});

// Export for global access
window.App = App;
window.app = app;

console.log('🎉 E-commerce Chatbot loaded successfully!'); 