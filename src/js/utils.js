// Utility Functions - Azzo Platform
'use strict';

// DOM Helper Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Local Storage helpers
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Error removing from localStorage:', e);
      return false;
    }
  }
};

// Cookie helpers
const cookies = {
  set: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },
  
  get: (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  remove: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Form validation helpers
const validation = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  password: (password) => {
    return password.length >= 6;
  },
  
  required: (value) => {
    return value && value.trim().length > 0;
  },
  
  phone: (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
  }
};

// Alert/Notification system
const showAlert = (message, type = 'info', duration = 5000) => {
  const alertContainer = $('#alert-container');
  if (!alertContainer) return;
  
  const alertId = `alert-${Date.now()}`;
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} fade-in" role="alert">
      <div class="alert-content">
        <span class="alert-message">${message}</span>
        <button type="button" class="alert-close" onclick="hideAlert('${alertId}')" aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  alertContainer.insertAdjacentHTML('beforeend', alertHTML);
  
  if (duration > 0) {
    setTimeout(() => hideAlert(alertId), duration);
  }
};

const hideAlert = (alertId) => {
  const alert = $(`#${alertId}`);
  if (alert) {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }
};

// Loading state management
const setLoadingState = (element, isLoading = true) => {
  if (!element) return;
  
  if (isLoading) {
    element.classList.add('loading');
    element.disabled = true;
    
    const btnText = element.querySelector('.btn-text');
    const btnSpinner = element.querySelector('.btn-spinner');
    
    if (btnText) btnText.style.opacity = '0';
    if (btnSpinner) btnSpinner.classList.remove('hidden');
  } else {
    element.classList.remove('loading');
    element.disabled = false;
    
    const btnText = element.querySelector('.btn-text');
    const btnSpinner = element.querySelector('.btn-spinner');
    
    if (btnText) btnText.style.opacity = '1';
    if (btnSpinner) btnSpinner.classList.add('hidden');
  }
};

// API request helper
const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};

// Smooth scroll to element
const scrollToElement = (element, offset = 0) => {
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

// Format currency
const formatCurrency = (amount, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, locale = 'pt-BR') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Escape HTML
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Generate random ID
const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Device detection
const device = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: () => /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent),
  isDesktop: () => !device.isMobile() && !device.isTablet()
};

// Theme management
const theme = {
  get: () => {
    return storage.get('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  },
  
  set: (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    storage.set('theme', themeName);
  },
  
  toggle: () => {
    const current = theme.get();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    theme.set(newTheme);
    return newTheme;
  }
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  theme.set(theme.get());
});

// Performance monitoring
const perf = {
  mark: (name) => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};

// Accessibility helpers
const a11y = {
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  },
  
  announceToSR: (message) => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  }
};

// Export utilities for global use
window.utils = {
  $,
  $$,
  debounce,
  throttle,
  storage,
  cookies,
  validation,
  showAlert,
  hideAlert,
  setLoadingState,
  apiRequest,
  scrollToElement,
  formatCurrency,
  formatDate,
  escapeHtml,
  generateId,
  device,
  theme,
  perf,
  a11y
};
