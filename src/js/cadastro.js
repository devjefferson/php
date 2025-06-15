/**
 * Cadastro JavaScript - Azzo Platform
 * Funcionalidades: Validação, formatação, interações e envio do formulário
 */

class CadastroManager {
  constructor() {
    this.form = document.getElementById('register-form');
    this.passwordInput = document.getElementById('senha');
    this.passwordToggle = document.getElementById('password-toggle');
    this.strengthBar = document.getElementById('strength-bar');
    this.strengthText = document.getElementById('strength-text');
    this.submitButton = document.getElementById('register-button');
    this.alertContainer = document.getElementById('alert-container');
    this.successModal = document.getElementById('success-modal');
    this.loadingOverlay = document.getElementById('loading-overlay');
    
    this.isSubmitting = false;
    this.validationRules = this.initValidationRules();
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFormMasks();
    this.setupValidation();
    this.setupAccessibility();
    this.checkUrlParams();
  }

  initValidationRules() {
    return {
      nome: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        message: 'Nome deve conter apenas letras e espaços'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Digite um e-mail válido'
      },
      telefone: {
        required: true,
        pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        message: 'Digite um telefone válido: (11) 99999-9999'
      },
      datanascimento: {
        required: true,
        custom: this.validateAge,
        message: 'Você deve ter pelo menos 13 anos'
      },
      genero: {
        required: true,
        message: 'Selecione seu gênero'
      },
      cidade: {
        required: true,
        minLength: 2,
        message: 'Digite sua cidade'
      },
      estado: {
        required: true,
        minLength: 2,
        message: 'Digite seu estado'
      },
      endereco: {
        required: true,
        minLength: 5,
        message: 'Digite seu endereço completo'
      },
      senha: {
        required: true,
        minLength: 8,
        custom: this.validatePasswordStrength,
        message: 'Senha deve ter pelo menos 8 caracteres'
      },
      terms: {
        required: true,
        message: 'Você deve aceitar os termos de uso'
      }
    };
  }

  bindEvents() {
    // Form submission
    this.form?.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Password toggle
    this.passwordToggle?.addEventListener('click', this.togglePassword.bind(this));
    
    // Real-time validation
    const inputs = this.form?.querySelectorAll('input');
    inputs?.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
    
    // Password strength
    this.passwordInput?.addEventListener('input', this.updatePasswordStrength.bind(this));
    
    // Modal close
    const modalOverlay = this.successModal?.querySelector('.modal-overlay');
    modalOverlay?.addEventListener('click', this.closeModal.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Google register (placeholder)
    const googleBtn = document.getElementById('google-register');
    googleBtn?.addEventListener('click', this.handleGoogleRegister.bind(this));
  }

  setupFormMasks() {
    // Telefone mask
    const telefoneInput = document.getElementById('telefone');
    telefoneInput?.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      e.target.value = value;
    });
    
    // Nome mask (apenas letras)
    const nomeInput = document.getElementById('nome');
    nomeInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    });
  }

  setupValidation() {
    // Custom validation messages
    const inputs = this.form?.querySelectorAll('input[required]');
    inputs?.forEach(input => {
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.validateField(input);
      });
    });
  }

  setupAccessibility() {
    // Form sections keyboard navigation
    const sections = this.form?.querySelectorAll('.form-section');
    sections?.forEach((section, index) => {
      const title = section.querySelector('.section-title');
      title?.setAttribute('role', 'heading');
      title?.setAttribute('aria-level', '3');
      title?.setAttribute('tabindex', '0');
    });
    
    // Error announcements
    this.alertContainer?.setAttribute('aria-live', 'polite');
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sucesso') === '1') {
      this.showSuccessModal();
    }
    if (urlParams.get('erro')) {
      this.showAlert('Erro ao criar conta. Tente novamente.', 'error');
    }
  }

  validateField(input) {
    const fieldName = input.name;
    const rule = this.validationRules[fieldName];
    if (!rule) return true;

    const value = fieldName === 'genero' ? 
      this.form?.querySelector(`input[name="genero"]:checked`)?.value : 
      input.value.trim();

    let isValid = true;
    let message = '';

    // Required validation
    if (rule.required && !value) {
      isValid = false;
      message = `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    
    // Pattern validation
    else if (value && rule.pattern && !rule.pattern.test(value)) {
      isValid = false;
      message = rule.message;
    }
    
    // Min length validation
    else if (value && rule.minLength && value.length < rule.minLength) {
      isValid = false;
      message = `${this.getFieldLabel(fieldName)} deve ter pelo menos ${rule.minLength} caracteres`;
    }
    
    // Custom validation
    else if (value && rule.custom && !rule.custom(value)) {
      isValid = false;
      message = rule.message;
    }

    this.setFieldValidation(input, isValid, message);
    return isValid;
  }

  validatePasswordStrength(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    return score >= 3;
  }

  validateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 13;
  }

  updatePasswordStrength() {
    const password = this.passwordInput.value;
    if (!password) {
      this.strengthBar.className = 'strength-bar';
      this.strengthText.textContent = 'Digite uma senha';
      return;
    }

    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    let strength = '';
    let text = '';
    
    if (score <= 2) {
      strength = 'weak';
      text = 'Senha fraca';
    } else if (score === 3) {
      strength = 'fair';
      text = 'Senha razoável';
    } else if (score === 4) {
      strength = 'good';
      text = 'Senha boa';
    } else {
      strength = 'strong';
      text = 'Senha forte';
    }
    
    this.strengthBar.className = `strength-bar ${strength}`;
    this.strengthText.textContent = text;
  }

  setFieldValidation(input, isValid, message) {
    const errorElement = document.getElementById(`${input.name}-error`);
    
    if (isValid) {
      input.classList.remove('error');
      input.classList.add('success');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
      }
    } else {
      input.classList.remove('success');
      input.classList.add('error');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
      }
    }
    
    // Update aria-invalid
    input.setAttribute('aria-invalid', !isValid);
  }

  clearFieldError(input) {
    if (input.classList.contains('error')) {
      input.classList.remove('error');
      const errorElement = document.getElementById(`${input.name}-error`);
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    }
  }

  getFieldLabel(fieldName) {
    const labels = {
      nome: 'Nome',
      email: 'E-mail',
      telefone: 'Telefone',
      datanascimento: 'Data de nascimento',
      genero: 'Gênero',
      cidade: 'Cidade',
      estado: 'Estado',
      endereco: 'Endereço',
      senha: 'Senha',
      terms: 'Termos de uso'
    };
    return labels[fieldName] || fieldName;
  }

  togglePassword() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    
    // Update icon (simplified)
    const icon = this.passwordToggle.querySelector('svg');
    if (icon) {
      icon.style.opacity = isPassword ? '0.6' : '1';
    }
    
    // Update aria-label
    this.passwordToggle.setAttribute('aria-label', 
      isPassword ? 'Ocultar senha' : 'Mostrar senha'
    );
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate all fields
    const inputs = this.form.querySelectorAll('input');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      this.showAlert('Por favor, corrija os erros no formulário.', 'error');
      this.focusFirstError();
      return;
    }
    
    // Show loading
    this.setLoading(true);
    
    try {
      // Get CSRF token
      const csrfResponse = await fetch('assets/php/csrf_token.php');
      const csrfToken = await csrfResponse.text();
      
      // Collect form data
      const formData = new FormData(this.form);
      formData.append('csrf_token', csrfToken);
      
      // Submit form
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showSuccessModal();
        this.trackEvent('user_registered', {
          method: 'form'
        });
        
        // Redirect after success
        setTimeout(() => {
          if (result.redirect) {
            window.location.href = result.redirect;
          }
        }, 2000);
      } else {
        // Show specific errors if available
        if (result.errors && result.errors.length > 0) {
          this.showAlert(result.errors.join('<br>'), 'error');
        } else {
          this.showAlert(result.message || 'Erro ao criar conta. Tente novamente.', 'error');
        }
      }
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      this.showAlert('Erro ao criar conta. Tente novamente.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.isSubmitting = loading;
    
    if (loading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
      this.loadingOverlay.classList.add('show');
      this.loadingOverlay.setAttribute('aria-hidden', 'false');
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
      this.loadingOverlay.classList.remove('show');
      this.loadingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  showAlert(message, type = 'info') {
    const alert = createAlert(message, type);
    this.alertContainer.innerHTML = '';
    this.alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  showSuccessModal() {
    this.successModal.classList.add('show');
    this.successModal.setAttribute('aria-hidden', 'false');
    
    // Focus management
    const firstButton = this.successModal.querySelector('.btn');
    setTimeout(() => firstButton?.focus(), 100);
    
    // Auto close after 10 seconds
    setTimeout(() => {
      this.closeModal();
    }, 10000);
  }

  closeModal() {
    this.successModal.classList.remove('show');
    this.successModal.setAttribute('aria-hidden', 'true');
  }

  focusFirstError() {
    const firstError = this.form.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  handleKeyDown(e) {
    // Modal keyboard handling
    if (this.successModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    }
    
    // Form navigation shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSubmit(e);
      }
    }
  }

  handleGoogleRegister() {
    // Placeholder for Google OAuth integration
    this.showAlert('Login com Google em desenvolvimento', 'info');
    
    // In a real implementation, you would integrate with Google OAuth
    // window.google?.accounts.oauth2.initTokenClient({...});
  }

  trackEvent(eventName, properties = {}) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    
    // Console log for development
    console.log('Event tracked:', eventName, properties);
  }
}

// Utility function to create alerts
function createAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <div class="alert-icon">
      ${getAlertIcon(type)}
    </div>
    <div class="alert-content">
      <p class="alert-message">${escapeHtml(message)}</p>
    </div>
    <button class="alert-close" aria-label="Fechar alerta">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  
  // Close functionality
  const closeBtn = alert.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => alert.remove());
  
  return alert;
}

function getAlertIcon(type) {
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/></svg>'
  };
  return icons[type] || icons.info;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cadastroManager = new CadastroManager();
});

// Performance monitoring
window.addEventListener('load', () => {
  // Track page load performance
  const perfData = performance.getEntriesByType('navigation')[0];
  if (perfData) {
    console.log('Cadastro page loaded in:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CadastroManager };
}
