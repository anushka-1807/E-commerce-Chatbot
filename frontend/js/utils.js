/**
 * Utility functions for the E-commerce Chatbot frontend
 */

// Constants
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    currentSessionToken: null,
    currentSessionId: null,
    authToken: null
};

/**
 * API utility functions
 */
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Add auth token if available
        if (AppState.authToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${AppState.authToken}`;
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        console.log('🌐 Making API request:', { url, method: config.method || 'GET', headers: config.headers });

        try {
            const response = await fetch(url, config);
            
            console.log('📡 API response received:', { 
                status: response.status, 
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch((parseError) => {
                    console.error('Failed to parse error response as JSON:', parseError);
                    return { error: `HTTP ${response.status}: ${response.statusText}` };
                });
                
                console.error('❌ API error response:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API success response:', data);
            return data;
            
        } catch (error) {
            console.error('🚨 API request failed:', {
                url,
                error: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Check for common network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
            }
            
            throw error;
        }
    }

    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

/**
 * Local storage utilities
 */
class StorageManager {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    static getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return null;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
}

/**
 * DOM utility functions
 */
class DOMUtils {
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static show(element, display = 'block') {
        if (element) element.style.display = display;
    }

    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    static toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    }

    static hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}

/**
 * Toast notification functions
 */
class ToastManager {
    static show(message, type = 'success', duration = 5000) {
        const toastId = type === 'success' ? 'success-toast' : 'error-toast';
        const messageId = type === 'success' ? 'success-message' : 'error-message';
        
        const toast = DOMUtils.$(toastId);
        const messageElement = DOMUtils.$(messageId);
        
        if (!toast || !messageElement) return;

        messageElement.textContent = message;
        DOMUtils.addClass(toast, 'show');
        DOMUtils.show(toast, 'flex');

        // Auto hide after duration
        setTimeout(() => {
            this.hide(toastId);
        }, duration);
    }

    static hide(toastId) {
        const toast = DOMUtils.$(toastId);
        if (toast) {
            DOMUtils.removeClass(toast, 'show');
            setTimeout(() => {
                DOMUtils.hide(toast);
            }, 300);
        }
    }

    static success(message, duration = 5000) {
        this.show(message, 'success', duration);
    }

    static error(message, duration = 7000) {
        this.show(message, 'error', duration);
    }
}

// Global function for toast close buttons
function hideToast(toastId) {
    ToastManager.hide(toastId);
}

/**
 * Modal utility functions
 */
class ModalManager {
    static show(modalId) {
        const modal = DOMUtils.$(modalId);
        if (modal) {
            DOMUtils.show(modal, 'flex');
            DOMUtils.addClass(modal, 'show');
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    static hide(modalId) {
        const modal = DOMUtils.$(modalId);
        if (modal) {
            DOMUtils.removeClass(modal, 'show');
            setTimeout(() => {
                DOMUtils.hide(modal);
            }, 300);
        }
    }

    static toggle(modalId) {
        const modal = DOMUtils.$(modalId);
        if (modal && DOMUtils.hasClass(modal, 'show')) {
            this.hide(modalId);
        } else {
            this.show(modalId);
        }
    }
}

/**
 * Formatting utilities
 */
class FormatUtils {
    static formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    static formatTime(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static formatDateTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return this.formatTime(dateString);
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return this.formatDate(dateString);
        }
    }

    static formatRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }

        return starsHtml;
    }

    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

/**
 * Validation utilities
 */
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password.length >= 6;
    }

    static isValidUsername(username) {
        return username.length >= 3 && username.length <= 80;
    }

    static validateForm(formData, rules) {
        const errors = [];

        for (const [field, value] of Object.entries(formData)) {
            const rule = rules[field];
            if (!rule) continue;

            if (rule.required && (!value || value.trim() === '')) {
                errors.push(`${rule.label || field} is required`);
                continue;
            }

            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
            }

            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || field} must be less than ${rule.maxLength} characters`);
            }

            if (value && rule.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`${rule.label || field} must be a valid email address`);
            }

            if (value && rule.type === 'password' && !this.isValidPassword(value)) {
                errors.push(`${rule.label || field} must be at least 6 characters long`);
            }
        }

        return errors;
    }
}

/**
 * Debounce utility
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle utility
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        ToastManager.success('Copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy text:', error);
        ToastManager.error('Failed to copy text');
    }
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 0) {
    if (!element) return;
    
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Loading state management
 */
class LoadingManager {
    static show(elementId) {
        const element = DOMUtils.$(elementId);
        if (element) {
            element.disabled = true;
            element.classList.add('loading');
        }
    }

    static hide(elementId) {
        const element = DOMUtils.$(elementId);
        if (element) {
            element.disabled = false;
            element.classList.remove('loading');
        }
    }
}

/**
 * Initialize app state from localStorage
 */
function initializeAppState() {
    console.log('🔧 Initializing app state from localStorage...');
    
    const savedToken = StorageManager.getItem('auth_token');
    const savedUser = StorageManager.getItem('current_user');
    const savedSessionToken = StorageManager.getItem('session_token');

    console.log('💾 Stored data found:', {
        hasToken: !!savedToken,
        hasUser: !!savedUser,
        hasSessionToken: !!savedSessionToken,
        tokenLength: savedToken ? savedToken.length : 0,
        userDetails: savedUser ? savedUser.username : 'none'
    });

    if (savedToken && savedUser) {
        AppState.authToken = savedToken;
        AppState.currentUser = savedUser;
        AppState.isAuthenticated = true;
        console.log('✅ App state restored from localStorage:', {
            isAuthenticated: AppState.isAuthenticated,
            username: AppState.currentUser?.username
        });
    } else {
        console.log('❌ No valid auth data found in localStorage');
        AppState.isAuthenticated = false;
        AppState.authToken = null;
        AppState.currentUser = null;
    }

    if (savedSessionToken) {
        AppState.currentSessionToken = savedSessionToken;
        console.log('✅ Session token restored');
    }
    
    console.log('🎯 Final app state:', AppState);
}

/**
 * Clear app state and localStorage
 */
function clearAppState() {
    AppState.isAuthenticated = false;
    AppState.currentUser = null;
    AppState.currentSessionToken = null;
    AppState.currentSessionId = null;
    AppState.authToken = null;

    StorageManager.removeItem('auth_token');
    StorageManager.removeItem('current_user');
    StorageManager.removeItem('session_token');
}

// Initialize app state on load
document.addEventListener('DOMContentLoaded', initializeAppState);

// Export utilities for global use
window.ApiClient = ApiClient;
window.StorageManager = StorageManager;
window.DOMUtils = DOMUtils;
window.ToastManager = ToastManager;
window.ModalManager = ModalManager;
window.FormatUtils = FormatUtils;
window.ValidationUtils = ValidationUtils;
window.LoadingManager = LoadingManager;
window.AppState = AppState;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.copyToClipboard = copyToClipboard;
window.autoResizeTextarea = autoResizeTextarea;
window.scrollToElement = scrollToElement;
window.isInViewport = isInViewport;
window.initializeAppState = initializeAppState;
window.clearAppState = clearAppState; 