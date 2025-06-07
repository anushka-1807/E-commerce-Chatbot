/**
 * Authentication module for the E-commerce Chatbot
 */

class AuthManager {
    constructor() {
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupModalBehavior();
        this.updateUIBasedOnAuth();
    }

    bindEvents() {
        console.log('🔧 AuthManager: Binding events...');
        
        // Auth modal triggers
        const loginBtn = DOMUtils.$('#login-btn');
        const registerBtn = DOMUtils.$('#register-btn');
        const startShoppingBtn = DOMUtils.$('#start-shopping-btn');
        
        console.log('🔍 Elements found:', {
            loginBtn: !!loginBtn,
            registerBtn: !!registerBtn,
            startShoppingBtn: !!startShoppingBtn
        });
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('🔐 Login button clicked!');
                this.showLoginModal();
            });
            console.log('✅ Login button event listener added');
        } else {
            console.error('❌ Login button not found!');
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                console.log('📝 Register button clicked!');
                this.showRegisterModal();
            });
            console.log('✅ Register button event listener added');
        } else {
            console.error('❌ Register button not found!');
        }
        
        if (startShoppingBtn) {
            startShoppingBtn.addEventListener('click', () => {
                console.log('🛍️ Start shopping button clicked!');
                if (AppState.isAuthenticated) {
                    this.showChatInterface();
                } else {
                    this.showLoginModal();
                }
            });
            console.log('✅ Start shopping button event listener added');
        } else {
            console.error('❌ Start shopping button not found!');
        }

        // Modal controls
        const authModalClose = DOMUtils.$('#auth-modal-close');
        const authModal = DOMUtils.$('#auth-modal');
        const authSwitchLink = DOMUtils.$('#auth-switch-link');
        
        console.log('🔍 Modal elements found:', {
            authModalClose: !!authModalClose,
            authModal: !!authModal,
            authSwitchLink: !!authSwitchLink
        });
        
        if (authModalClose) {
            authModalClose.addEventListener('click', () => {
                console.log('❌ Modal close button clicked!');
                this.hideAuthModal();
            });
            console.log('✅ Modal close event listener added');
        } else {
            console.error('❌ Modal close button not found!');
        }
        
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    console.log('📱 Clicked outside modal - closing');
                    this.hideAuthModal();
                }
            });
            console.log('✅ Modal background click listener added');
        } else {
            console.error('❌ Auth modal not found!');
        }
        
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Auth switch link clicked!');
                this.toggleAuthMode();
            });
            console.log('✅ Auth switch event listener added');
        } else {
            console.error('❌ Auth switch link not found!');
        }

        // Form submission
        const authForm = DOMUtils.$('#auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                console.log('📝 Auth form submitted!');
                this.handleFormSubmit(e);
            });
            console.log('✅ Auth form event listener added');
        } else {
            console.error('❌ Auth form not found!');
        }

        // Logout
        const logoutBtn = DOMUtils.$('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('🚪 Logout button clicked!');
                this.logout();
            });
            console.log('✅ Logout button event listener added');
        } else {
            console.log('ℹ️ Logout button not found (this is normal if user is not logged in)');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                console.log('⌨️ Escape key pressed - hiding modals');
                this.hideAuthModal();
            }
        });
        console.log('✅ Keyboard event listener added');
        
        console.log('🎉 AuthManager: All events bound successfully!');
    }

    setupModalBehavior() {
        // Auto-fill demo credentials when clicking on them
        const demoCredentials = DOMUtils.$('.demo-credentials');
        if (demoCredentials) {
            demoCredentials.addEventListener('click', () => {
                this.fillDemoCredentials();
            });
        }
    }

    showLoginModal() {
        try {
            console.log('🔐 Showing login modal...');
            this.isLoginMode = true;
            this.updateModalForMode();
            ModalManager.show('auth-modal');
            console.log('✅ Login modal shown successfully');
        } catch (error) {
            console.error('❌ Error showing login modal:', error);
            // Fallback: show modal directly
            const modal = document.getElementById('auth-modal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                console.log('📱 Modal shown using fallback method');
            }
        }
    }

    showRegisterModal() {
        this.isLoginMode = false;
        this.updateModalForMode();
        ModalManager.show('auth-modal');
    }

    hideAuthModal() {
        ModalManager.hide('auth-modal');
        this.clearForm();
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        this.updateModalForMode();
        this.clearForm();
    }

    updateModalForMode() {
        const title = DOMUtils.$('#auth-modal-title');
        const submitBtn = DOMUtils.$('#auth-submit');
        const switchText = DOMUtils.$('#auth-switch-text');
        const switchLink = DOMUtils.$('#auth-switch-link');
        const emailGroup = DOMUtils.$('#email-group');

        if (this.isLoginMode) {
            if (title) title.textContent = 'Login';
            if (submitBtn) submitBtn.textContent = 'Login';
            if (switchText) switchText.innerHTML = "Don't have an account? ";
            if (switchLink) switchLink.textContent = 'Sign up';
            if (emailGroup) DOMUtils.hide(emailGroup);
        } else {
            if (title) title.textContent = 'Sign Up';
            if (submitBtn) submitBtn.textContent = 'Sign Up';
            if (switchText) switchText.innerHTML = 'Already have an account? ';
            if (switchLink) switchLink.textContent = 'Login';
            if (emailGroup) DOMUtils.show(emailGroup);
        }
    }

    fillDemoCredentials() {
        const usernameInput = DOMUtils.$('#auth-username');
        const passwordInput = DOMUtils.$('#auth-password');

        if (usernameInput) usernameInput.value = 'Adi';
        if (passwordInput) passwordInput.value = 'Aditya123@';

        // Switch to login mode if in register mode
        if (!this.isLoginMode) {
            this.toggleAuthMode();
        }
    }

    clearForm() {
        const form = DOMUtils.$('#auth-form');
        if (form) {
            form.reset();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            username: formData.get('username')?.trim(),
            password: formData.get('password')
        };

        if (!this.isLoginMode) {
            data.email = formData.get('email')?.trim();
        }

        // Validate form data
        const validationRules = {
            username: { required: true, minLength: 3, maxLength: 80, label: 'Username' },
            password: { required: true, minLength: 6, type: 'password', label: 'Password' }
        };

        if (!this.isLoginMode) {
            validationRules.email = { required: true, type: 'email', label: 'Email' };
        }

        const errors = ValidationUtils.validateForm(data, validationRules);
        if (errors.length > 0) {
            ToastManager.error(errors[0]);
            return;
        }

        try {
            LoadingManager.show('auth-submit');
            
            let response;
            if (this.isLoginMode) {
                response = await this.login(data.username, data.password);
            } else {
                response = await this.register(data.username, data.email, data.password);
            }

            // Handle successful authentication
            this.handleAuthSuccess(response);
            
        } catch (error) {
            console.error('Authentication error:', error);
            ToastManager.error(error.message || 'Authentication failed');
        } finally {
            LoadingManager.hide('auth-submit');
        }
    }

    async login(username, password) {
        console.log('🔐 Attempting login...', { username, apiUrl: `${API_BASE_URL}/auth/login` });
        
        try {
            const response = await ApiClient.post('/auth/login', {
                username,
                password
            });
            
            console.log('✅ Login successful:', response);
            return response;
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Re-throw with more context
            throw new Error(error.message || 'Login request failed');
        }
    }

    async register(username, email, password) {
        const response = await ApiClient.post('/auth/register', {
            username,
            email,
            password
        });

        return response;
    }

    handleAuthSuccess(response) {
        // Store auth data
        AppState.authToken = response.access_token;
        AppState.currentUser = response.user;
        AppState.isAuthenticated = true;

        StorageManager.setItem('auth_token', response.access_token);
        StorageManager.setItem('current_user', response.user);

        // Update UI
        this.updateUIBasedOnAuth();
        this.hideAuthModal();

        // Show success message
        const action = this.isLoginMode ? 'logged in' : 'registered';
        ToastManager.success(`Successfully ${action}! Welcome ${response.user.username}!`);

        // Navigate to chat interface
        setTimeout(() => {
            this.showChatInterface();
        }, 1000);
    }

    logout() {
        // Clear state
        clearAppState();

        // Update UI
        this.updateUIBasedOnAuth();

        // Show welcome screen
        this.showWelcomeScreen();

        ToastManager.success('Logged out successfully');
    }

    updateUIBasedOnAuth() {
        const userInfo = DOMUtils.$('#user-info');
        const authButtons = DOMUtils.$('#auth-buttons');
        const usernameDisplay = DOMUtils.$('#username-display');

        if (AppState.isAuthenticated && AppState.currentUser) {
            // Show user info, hide auth buttons
            if (userInfo) DOMUtils.show(userInfo, 'flex');
            if (authButtons) DOMUtils.hide(authButtons);
            if (usernameDisplay) usernameDisplay.textContent = AppState.currentUser.username;
        } else {
            // Hide user info, show auth buttons
            if (userInfo) DOMUtils.hide(userInfo);
            if (authButtons) DOMUtils.show(authButtons, 'flex');
        }
    }

    showWelcomeScreen() {
        const welcomeScreen = DOMUtils.$('#welcome-screen');
        const chatInterface = DOMUtils.$('#chat-interface');

        if (welcomeScreen) DOMUtils.show(welcomeScreen, 'flex');
        if (chatInterface) DOMUtils.hide(chatInterface);
    }

    showChatInterface() {
        const welcomeScreen = DOMUtils.$('#welcome-screen');
        const chatInterface = DOMUtils.$('#chat-interface');

        if (welcomeScreen) DOMUtils.hide(welcomeScreen);
        if (chatInterface) DOMUtils.show(chatInterface, 'grid');

        // Initialize chatbot if needed
        if (window.ChatManager) {
            window.ChatManager.initialize();
        }
    }

    async getCurrentUser() {
        if (!AppState.isAuthenticated) {
            console.log('❌ User not authenticated, cannot get current user');
            return null;
        }

        try {
            console.log('📡 Fetching current user from API...');
            const response = await ApiClient.get('/auth/me');
            console.log('✅ Current user fetched successfully:', response.user);
            return response.user;
        } catch (error) {
            console.error('❌ Failed to get current user:', error);
            // Don't automatically logout on API error
            // The token might still be valid, but the API might be temporarily unavailable
            return null;
        }
    }

    async validateToken() {
        if (!AppState.authToken) {
            console.log('❌ No auth token available for validation');
            return false;
        }

        try {
            console.log('🔍 Validating auth token...');
            const user = await this.getCurrentUser();
            if (user) {
                console.log('✅ Token validation successful, user:', user);
                return true;
            } else {
                console.warn('❌ Token validation failed: no user returned');
                return false;
            }
        } catch (error) {
            console.error('🚨 Token validation error:', error);
            // Don't automatically logout on validation error
            // Let the caller decide what to do
            return false;
        }
    }

    isAuthenticated() {
        return AppState.isAuthenticated && AppState.authToken;
    }

    getCurrentUserData() {
        return AppState.currentUser;
    }

    getAuthToken() {
        return AppState.authToken;
    }
}

// Auto-login check on page load
class AuthInitializer {
    static async init() {
        console.log('🚀 AuthInitializer: Starting initialization...');
        console.log('📊 Current AppState:', AppState);
        
        const authManager = new AuthManager();
        
        // If we have stored auth data, validate it
        if (AppState.isAuthenticated && AppState.authToken) {
            console.log('🔍 Found existing auth data, validating token...');
            
            try {
                const isValid = await authManager.validateToken();
                
                if (isValid) {
                    console.log('✅ Token validation successful');
                    // Auto-show chat interface for authenticated users
                    authManager.showChatInterface();
                    console.log('🎉 User auto-logged in, showing chat interface');
                } else {
                    console.warn('❌ Token validation failed, showing welcome screen');
                    // Show welcome screen if validation failed
                    authManager.showWelcomeScreen();
                }
            } catch (error) {
                console.error('🚨 Error during token validation:', error);
                // Don't logout on validation error, just show welcome screen
                authManager.showWelcomeScreen();
            }
        } else {
            console.log('ℹ️ No auth data found, showing welcome screen');
            // Show welcome screen for unauthenticated users
            authManager.showWelcomeScreen();
        }

        return authManager;
    }
}

// Initialize when DOM is ready
let authManagerInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM Content Loaded - starting auth initialization');
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = DOMUtils.$('#loading-screen');
        const app = DOMUtils.$('#app');
        
        if (loadingScreen) DOMUtils.hide(loadingScreen);
        if (app) DOMUtils.show(app, 'flex');
        
        console.log('📱 Loading screen hidden, app shown');
    }, 1500); // Show loading for 1.5 seconds

    // Initialize auth manager with retry
    const initializeAuth = () => {
        console.log('🔄 Attempting to initialize AuthManager...');
        
        // Check if critical elements exist
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (!loginBtn || !registerBtn) {
            console.warn('⚠️ Login/Register buttons not found yet, retrying in 500ms...');
            setTimeout(initializeAuth, 500);
            return;
        }
        
        console.log('✅ Critical elements found, initializing AuthManager');
        AuthInitializer.init().then(manager => {
            authManagerInstance = manager;
            console.log('🎉 AuthManager initialized successfully!');
        }).catch(error => {
            console.error('❌ Failed to initialize AuthManager:', error);
        });
    };
    
    // Start initialization after loading screen delay
    setTimeout(initializeAuth, 1600);
});

// Export for global access
window.AuthManager = AuthManager;
window.authManager = authManagerInstance;

// EMERGENCY FALLBACK - Simple direct event binding
// This ensures login buttons work even if AuthManager fails
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit longer for all elements to be ready
    setTimeout(() => {
        console.log('🚨 Emergency fallback: Checking for unbind buttons...');
        
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const authModal = document.getElementById('auth-modal');
        
        if (loginBtn && !loginBtn.hasAttribute('data-bound')) {
            console.log('🔧 Emergency: Binding login button directly');
            loginBtn.addEventListener('click', () => {
                console.log('🔐 EMERGENCY: Login button clicked!');
                if (authModal) {
                    authModal.style.display = 'flex';
                    authModal.classList.add('show');
                    console.log('✅ EMERGENCY: Modal shown');
                }
            });
            loginBtn.setAttribute('data-bound', 'true');
        }
        
        if (registerBtn && !registerBtn.hasAttribute('data-bound')) {
            console.log('🔧 Emergency: Binding register button directly');
            registerBtn.addEventListener('click', () => {
                console.log('📝 EMERGENCY: Register button clicked!');
                if (authModal) {
                    authModal.style.display = 'flex';
                    authModal.classList.add('show');
                    console.log('✅ EMERGENCY: Modal shown');
                }
            });
            registerBtn.setAttribute('data-bound', 'true');
        }
        
        // Modal close functionality
        const modalClose = document.getElementById('auth-modal-close');
        if (modalClose && !modalClose.hasAttribute('data-bound')) {
            modalClose.addEventListener('click', () => {
                console.log('❌ EMERGENCY: Closing modal');
                if (authModal) {
                    authModal.style.display = 'none';
                    authModal.classList.remove('show');
                }
            });
            modalClose.setAttribute('data-bound', 'true');
        }
        
        // Click outside to close
        if (authModal && !authModal.hasAttribute('data-bound')) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    console.log('📱 EMERGENCY: Clicked outside modal');
                    authModal.style.display = 'none';
                    authModal.classList.remove('show');
                }
            });
            authModal.setAttribute('data-bound', 'true');
        }
        
        // Form submission
        const authForm = document.getElementById('auth-form');
        if (authForm && !authForm.hasAttribute('data-bound')) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('📝 EMERGENCY: Form submitted');
                
                const formData = new FormData(e.target);
                const username = formData.get('username')?.trim();
                const password = formData.get('password');
                
                if (!username || !password) {
                    alert('Please enter username and password');
                    return;
                }
                
                try {
                    console.log('🌐 EMERGENCY: Attempting login...');
                    const response = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ EMERGENCY: Login successful!', data);
                        
                        // Store auth data
                        console.log('💾 EMERGENCY: Storing auth data in localStorage...');
                        StorageManager.setItem('auth_token', data.access_token);
                        StorageManager.setItem('current_user', data.user);
                        
                        // Update app state immediately
                        AppState.authToken = data.access_token;
                        AppState.currentUser = data.user;
                        AppState.isAuthenticated = true;
                        
                        console.log('✅ EMERGENCY: App state updated:', AppState);
                        
                        // Hide modal
                        authModal.style.display = 'none';
                        authModal.classList.remove('show');
                        
                        // Show success message
                        alert(`Welcome ${data.user.username}! Login successful!`);
                        
                        // Update UI to show user is logged in
                        const userInfo = document.getElementById('user-info');
                        const authButtons = document.getElementById('auth-buttons');
                        const usernameDisplay = document.getElementById('username-display');
                        
                        if (userInfo) {
                            userInfo.style.display = 'flex';
                            console.log('✅ EMERGENCY: User info shown');
                        }
                        if (authButtons) {
                            authButtons.style.display = 'none';
                            console.log('✅ EMERGENCY: Auth buttons hidden');
                        }
                        if (usernameDisplay) {
                            usernameDisplay.textContent = data.user.username;
                            console.log('✅ EMERGENCY: Username display updated');
                        }
                        
                        // Show chat interface
                        const welcomeScreen = document.getElementById('welcome-screen');
                        const chatInterface = document.getElementById('chat-interface');
                        
                        if (welcomeScreen) {
                            welcomeScreen.style.display = 'none';
                            console.log('✅ EMERGENCY: Welcome screen hidden');
                        }
                        if (chatInterface) {
                            chatInterface.style.display = 'grid';
                            console.log('✅ EMERGENCY: Chat interface shown');
                        }
                        
                        console.log('🎉 EMERGENCY: Login complete, user logged in successfully!');
                        
                    } else {
                        const errorData = await response.json();
                        console.error('❌ EMERGENCY: Login failed:', errorData);
                        alert('Login failed: ' + (errorData.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('🚨 EMERGENCY: Network error:', error);
                    alert('Network error: ' + error.message);
                }
            });
            authForm.setAttribute('data-bound', 'true');
        }
        
        console.log('🚨 Emergency fallback setup complete');
    }, 3000); // Wait 3 seconds for everything to load
}); 