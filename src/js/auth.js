// Authentication System - Azzo Platform
'use strict';

class AuthManager {
  constructor() {
    this.apiEndpoints = {
      login: 'assets/php/Login.php',
      register: 'assets/php/Register.php',
      logout: 'assets/php/logout.php',
      forgotPassword: 'assets/php/forgot-password.php',
      resetPassword: 'assets/php/reset-password.php'
    };
    
    this.init();
  }
  
  init() {
    // Verificar se já está logado
    this.checkAuthState();
    
    // Adicionar listeners para formulários
    this.setupFormListeners();
  }
  
  checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn && loginTime) {
      // Verificar se a sessão expirou (24 horas)
      const now = new Date().getTime();
      const loginTimeNum = parseInt(loginTime);
      const hoursSinceLogin = (now - loginTimeNum) / (1000 * 60 * 60);
      
      if (hoursSinceLogin > 24) {
        this.logout();
        return;
      }
    }
  }
  
  setupFormListeners() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Register form submission
    const registerForm = utils.$('.register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
    
    // Password visibility toggle
    const passwordToggles = utils.$$('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });
    
    // Real-time validation
    const formInputs = utils.$$('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('blur', (e) => this.validateField(e.target));
      input.addEventListener('input', utils.debounce((e) => {
        if (e.target.classList.contains('error')) {
          this.validateField(e.target);
        }
      }, 300));
    });
  }
  
  async handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('#email').value;
    const senha = form.querySelector('#senha').value;
    const remember = form.querySelector('input[name="remember"]').checked;
    
    try {
      // Mostrar loading
      this.showLoading();
      
      const response = await fetch(this.apiEndpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha, remember })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Salvar estado de autenticação
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTime', new Date().getTime().toString());
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        // Redirecionar para a página inicial
        window.location.href = 'home.html';
      } else {
        this.showError(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      this.showError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      this.hideLoading();
    }
  }
  
  async handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.form-submit');
    const formData = new FormData(form);
    
    // Clear previous errors
    this.clearFormErrors(form);
    
    // Validate form
    const validation = this.validateRegisterForm(form);
    if (!validation.isValid) {
      this.displayFormErrors(validation.errors);
      return;
    }
    
    // Set loading state
    utils.setLoadingState(submitBtn, true);
    this.showLoadingOverlay('Criando sua conta...');
    
    try {
      const response = await fetch(this.apiEndpoints.register, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const result = await response.text();
      
      if (result.includes('sucesso') || result.includes('Cadastro realizado')) {
        utils.showAlert('Conta criada com sucesso! Redirecionando para o login...', 'success');
        
        setTimeout(() => {
          window.location.href = 'login-new.html';
        }, 2000);
        
      } else if (result.includes('já existe') || result.includes('já cadastrado')) {
        this.showFieldError('email', 'Este e-mail já está cadastrado em nosso sistema.');
        utils.showAlert('E-mail já cadastrado. Tente fazer login ou use outro e-mail.', 'error');
        
      } else {
        utils.showAlert('Erro ao crear conta. Tente novamente.', 'error');
      }
      
    } catch (error) {
      console.error('Register error:', error);
      utils.showAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
    } finally {
      utils.setLoadingState(submitBtn, false);
      this.hideLoadingOverlay();
    }
  }
  
  validateLoginForm(form) {
    const errors = {};
    let isValid = true;
    
    // Email validation
    const email = form.querySelector('input[name="email"]').value.trim();
    if (!utils.validation.required(email)) {
      errors.email = 'E-mail é obrigatório.';
      isValid = false;
    } else if (!utils.validation.email(email)) {
      errors.email = 'Digite um e-mail válido.';
      isValid = false;
    }
    
    // Password validation
    const password = form.querySelector('input[name="senha"]').value;
    if (!utils.validation.required(password)) {
      errors.senha = 'Senha é obrigatória.';
      isValid = false;
    } else if (!utils.validation.password(password)) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres.';
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  validateRegisterForm(form) {
    const errors = {};
    let isValid = true;
    
    // Name validation
    const name = form.querySelector('input[name="nome"]')?.value.trim();
    if (name !== undefined) {
      if (!utils.validation.required(name)) {
        errors.nome = 'Nome é obrigatório.';
        isValid = false;
      } else if (name.length < 2) {
        errors.nome = 'Nome deve ter pelo menos 2 caracteres.';
        isValid = false;
      }
    }
    
    // Email validation
    const email = form.querySelector('input[name="email"]').value.trim();
    if (!utils.validation.required(email)) {
      errors.email = 'E-mail é obrigatório.';
      isValid = false;
    } else if (!utils.validation.email(email)) {
      errors.email = 'Digite um e-mail válido.';
      isValid = false;
    }
    
    // Password validation
    const password = form.querySelector('input[name="senha"]').value;
    if (!utils.validation.required(password)) {
      errors.senha = 'Senha é obrigatória.';
      isValid = false;
    } else if (password.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres.';
      isValid = false;
    }
    
    // Confirm password validation
    const confirmPassword = form.querySelector('input[name="confirm_senha"]')?.value;
    if (confirmPassword !== undefined) {
      if (password !== confirmPassword) {
        errors.confirm_senha = 'Senhas não coincidem.';
        isValid = false;
      }
    }
    
    // Phone validation
    const phone = form.querySelector('input[name="telefone"]')?.value.trim();
    if (phone !== undefined && phone) {
      if (!utils.validation.phone(phone)) {
        errors.telefone = 'Digite um telefone válido.';
        isValid = false;
      }
    }
    
    return { isValid, errors };
  }
  
  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (field.hasAttribute('required') && !utils.validation.required(value)) {
      isValid = false;
      errorMessage = 'Este campo é obrigatório.';
    }
    
    // Type-specific validation
    if (isValid && value) {
      switch (field.type) {
        case 'email':
          if (!utils.validation.email(value)) {
            isValid = false;
            errorMessage = 'Digite um e-mail válido.';
          }
          break;
          
        case 'password':
          if (!utils.validation.password(value)) {
            isValid = false;
            errorMessage = 'Senha deve ter pelo menos 6 caracteres.';
          }
          break;
          
        case 'tel':
          if (!utils.validation.phone(value)) {
            isValid = false;
            errorMessage = 'Digite um telefone válido.';
          }
          break;
      }
    }
    
    // Update field appearance
    if (isValid) {
      this.clearFieldError(fieldName);
    } else {
      this.showFieldError(fieldName, errorMessage);
    }
    
    return isValid;
  }
  
  showFieldError(fieldName, message) {
    const field = utils.$(`input[name="${fieldName}"]`);
    const errorElement = utils.$(`#${fieldName}-error`);
    
    if (field) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
  
  clearFieldError(fieldName) {
    const field = utils.$(`input[name="${fieldName}"]`);
    const errorElement = utils.$(`#${fieldName}-error`);
    
    if (field) {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    }
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
  
  clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.form-error');
    const fieldElements = form.querySelectorAll('.form-input');
    
    errorElements.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
    
    fieldElements.forEach(field => {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    });
  }
  
  displayFormErrors(errors) {
    Object.keys(errors).forEach(fieldName => {
      this.showFieldError(fieldName, errors[fieldName]);
    });
    
    // Focus on first error field
    const firstErrorField = utils.$('.form-input.error');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }
  
  togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const input = button.closest('.input-wrapper').querySelector('input');
    
    if (input.type === 'password') {
      input.type = 'text';
      button.setAttribute('aria-label', 'Ocultar senha');
    } else {
      input.type = 'password';
      button.setAttribute('aria-label', 'Mostrar senha');
    }
    
    // Keep focus on input
    input.focus();
  }
  
  showLoadingOverlay(message = 'Carregando...') {
    const overlay = utils.$('#loading-overlay');
    if (overlay) {
      const messageElement = overlay.querySelector('p');
      if (messageElement) {
        messageElement.textContent = message;
      }
      overlay.classList.remove('hidden');
    }
  }
  
  hideLoadingOverlay() {
    const overlay = utils.$('#loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  
  // Auto-fill remembered user
  autoFillRememberedUser() {
    const rememberedEmail = utils.cookies.get('remember_user');
    const emailField = utils.$('input[name="email"]');
    
    if (rememberedEmail && emailField) {
      emailField.value = rememberedEmail;
      const rememberCheckbox = utils.$('input[name="remember"]');
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
  }
  
  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  
  // Logout user
  logout() {
    // Limpar dados de autenticação
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('userInfo');
    utils.cookies.remove('remember_user');
    
    // Redirecionar para a página inicial
    window.location.href = 'home.html';
  }
  
  // Session timeout check
  checkSessionTimeout() {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;
    
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    const currentTime = new Date().getTime();
    const loginTimeMs = new Date(loginTime).getTime();
    
    if (currentTime - loginTimeMs > sessionDuration) {
      this.logout();
      return true;
    }
    
    return false;
  }
  
  showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }
  
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  
  showError(message) {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-error" role="alert">
          <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>${message}</span>
        </div>
      `;
    }
  }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Auto-fill remembered user on login page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('login')) {
    authManager.autoFillRememberedUser();
  }
  
  // Check session timeout on protected pages
  if (authManager.isLoggedIn()) {
    authManager.checkSessionTimeout();
  }
});

// Export for global use
window.authManager = authManager;
