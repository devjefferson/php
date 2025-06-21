// Authentication System - Azzo Platform (localStorage Version)
'use strict';

class LocalStorageAuthManager {
  constructor() {
    this.storageKeys = {
      users: 'azzo_users',
      currentUser: 'azzo_current_user',
      loginTime: 'azzo_login_time',
      isLoggedIn: 'azzo_is_logged_in'
    };
    
    this.init();
  }
  
  init() {
    // Inicializar storage de usuários se não existir
    this.initializeUsersStorage();
    
    // Verificar estado de autenticação
    this.checkAuthState();
    
    // Configurar listeners dos formulários
    this.setupFormListeners();
  }
  
  initializeUsersStorage() {
    if (!localStorage.getItem(this.storageKeys.users)) {
      localStorage.setItem(this.storageKeys.users, JSON.stringify([]));
    }
  }
  
  checkAuthState() {
    const isLoggedIn = localStorage.getItem(this.storageKeys.isLoggedIn) === 'true';
    const loginTime = localStorage.getItem(this.storageKeys.loginTime);
    
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
    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Register form
    const registerForm = document.querySelector('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
    
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });
    
    // Real-time validation
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('blur', (e) => this.validateField(e.target));
      input.addEventListener('input', this.debounce((e) => {
        if (e.target.classList.contains('error')) {
          this.validateField(e.target);
        }
      }, 300));
    });
  }
  
  async handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('#email').value.trim();
    const senha = form.querySelector('#senha').value;
    const remember = form.querySelector('input[name="remember"]')?.checked || false;
    
    try {
      // Mostrar loading
      this.showLoading();
      
      // Validar campos
      if (!email || !senha) {
        this.showError('E-mail e senha são obrigatórios');
        return;
      }
      
      if (!this.isValidEmail(email)) {
        this.showError('E-mail inválido');
        return;
      }
      
      // Buscar usuário no localStorage
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        this.showError('E-mail ou senha incorretos');
        return;
      }
      
      // Verificar senha
      if (!this.verifyPassword(senha, user.senha)) {
        this.showError('E-mail ou senha incorretos');
        return;
      }
      
      // Login bem sucedido
      this.setUserSession(user, remember);
      
      // Atualizar navbar imediatamente
      if (window.navbarAuth) {
        window.navbarAuth.updateNavbar();
      }
      
      this.showSuccess('Login realizado com sucesso!');
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Erro interno. Tente novamente mais tarde.');
    } finally {
      this.hideLoading();
    }
  }
  
  async handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      // Mostrar loading
      this.showLoading('Criando sua conta...');
      
      // Limpar erros anteriores
      this.clearFormErrors(form);
      
      // Validar formulário
      const validation = this.validateRegisterForm(form);
      if (!validation.isValid) {
        this.displayFormErrors(validation.errors);
        return;
      }
      
      // Extrair dados do formulário
      const userData = {
        nome: formData.get('nome').trim(),
        email: formData.get('email').trim().toLowerCase(),
        telefone: formData.get('telefone')?.trim() || '',
        genero: formData.get('genero'),
        datanascimento: formData.get('datanascimento'),
        cidade: formData.get('cidade').trim(),
        estado: formData.get('estado').trim(),
        endereco: formData.get('endereco').trim(),
        senha: formData.get('senha'),
        created_at: new Date().toISOString()
      };
      
      // Verificar se email já existe
      const users = this.getUsers();
      if (users.some(u => u.email === userData.email)) {
        this.showFieldError('email', 'Este e-mail já está cadastrado');
        this.showError('E-mail já cadastrado. Tente fazer login ou use outro e-mail.');
        return;
      }
      
      // Hash da senha (simulação simples)
      userData.senha = this.hashPassword(userData.senha);
      userData.id = this.generateUserId();
      
      // Salvar usuário
      users.push(userData);
      localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
      
      // Mostrar sucesso
      this.showSuccess('Conta criada com sucesso! Redirecionando para o login...');
      
      // Redirecionar após delay
      setTimeout(() => {
        window.location.href = 'login-new.html';
      }, 2000);
      
    } catch (error) {
      console.error('Register error:', error);
      this.showError('Erro ao criar conta. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }
  
  validateRegisterForm(form) {
    const errors = {};
    let isValid = true;
    
    // Nome
    const nome = form.querySelector('input[name="nome"]')?.value.trim();
    if (!nome) {
      errors.nome = 'Nome é obrigatório';
      isValid = false;
    } else if (nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
      isValid = false;
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
      errors.nome = 'Nome deve conter apenas letras e espaços';
      isValid = false;
    }
    
    // Email
    const email = form.querySelector('input[name="email"]')?.value.trim();
    if (!email) {
      errors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      errors.email = 'E-mail inválido';
      isValid = false;
    }
    
    // Telefone (opcional)
    const telefone = form.querySelector('input[name="telefone"]')?.value.trim();
    if (telefone) {
      const telefoneNumeros = telefone.replace(/\D/g, '');
      if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
        errors.telefone = 'Telefone inválido. Use o formato (00) 00000-0000';
        isValid = false;
      }
    }
    
    // Gênero
    const genero = form.querySelector('input[name="genero"]:checked')?.value;
    if (!genero) {
      errors.genero = 'Gênero é obrigatório';
      isValid = false;
    }
    
    // Data de nascimento
    const datanascimento = form.querySelector('input[name="datanascimento"]')?.value;
    if (!datanascimento) {
      errors.datanascimento = 'Data de nascimento é obrigatória';
      isValid = false;
    } else {
      const birthDate = new Date(datanascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.datanascimento = 'Você deve ter pelo menos 13 anos';
        isValid = false;
      }
    }
    
    // Cidade
    const cidade = form.querySelector('input[name="cidade"]')?.value.trim();
    if (!cidade) {
      errors.cidade = 'Cidade é obrigatória';
      isValid = false;
    } else if (cidade.length < 2) {
      errors.cidade = 'Cidade deve ter pelo menos 2 caracteres';
      isValid = false;
    }
    
    // Estado
    const estado = form.querySelector('input[name="estado"]')?.value.trim();
    if (!estado) {
      errors.estado = 'Estado é obrigatório';
      isValid = false;
    } else if (estado.length < 2) {
      errors.estado = 'Estado deve ter pelo menos 2 caracteres';
      isValid = false;
    }
    
    // Endereço
    const endereco = form.querySelector('input[name="endereco"]')?.value.trim();
    if (!endereco) {
      errors.endereco = 'Endereço é obrigatório';
      isValid = false;
    } else if (endereco.length < 5) {
      errors.endereco = 'Endereço deve ter pelo menos 5 caracteres';
      isValid = false;
    }
    
    // Senha
    const senha = form.querySelector('input[name="senha"]')?.value;
    if (!senha) {
      errors.senha = 'Senha é obrigatória';
      isValid = false;
    } else if (senha.length < 8) {
      errors.senha = 'Senha deve ter pelo menos 8 caracteres';
      isValid = false;
    }
    
    // Termos
    const terms = form.querySelector('input[name="terms"]')?.checked;
    if (!terms) {
      errors.terms = 'Você deve aceitar os termos de uso';
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    // Validação de campo obrigatório
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Este campo é obrigatório';
    }
    
    // Validações específicas por tipo
    if (isValid && value) {
      switch (field.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Digite um e-mail válido';
          }
          break;
          
        case 'password':
          if (value.length < 8) {
            isValid = false;
            errorMessage = 'Senha deve ter pelo menos 8 caracteres';
          }
          break;
          
        case 'tel':
          const phoneNumbers = value.replace(/\D/g, '');
          if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            isValid = false;
            errorMessage = 'Digite um telefone válido';
          }
          break;
      }
    }
    
    // Atualizar aparência do campo
    if (isValid) {
      this.clearFieldError(fieldName);
    } else {
      this.showFieldError(fieldName, errorMessage);
    }
    
    return isValid;
  }
  
  // Utility methods
  getUsers() {
    const users = localStorage.getItem(this.storageKeys.users);
    return users ? JSON.parse(users) : [];
  }
  
  generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  
  hashPassword(password) {
    // Simulação simples de hash (em produção, use uma biblioteca adequada)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  setUserSession(user, remember = false) {
    const userInfo = {
      id: user.id,
      nome: user.nome,
      email: user.email
    };
    
    localStorage.setItem(this.storageKeys.isLoggedIn, 'true');
    localStorage.setItem(this.storageKeys.loginTime, new Date().getTime().toString());
    localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(userInfo));
    
    if (remember) {
      localStorage.setItem('azzo_remember_email', user.email);
    }
  }
  
  getCurrentUser() {
    const userInfo = localStorage.getItem(this.storageKeys.currentUser);
    return userInfo ? JSON.parse(userInfo) : null;
  }
  
  isLoggedIn() {
    return localStorage.getItem(this.storageKeys.isLoggedIn) === 'true';
  }
  
  logout() {
    // Limpar dados de autenticação
    localStorage.removeItem(this.storageKeys.isLoggedIn);
    localStorage.removeItem(this.storageKeys.loginTime);
    localStorage.removeItem(this.storageKeys.currentUser);
    
    // Redirecionar para a página inicial
    window.location.href = 'home.html';
  }
  
  // UI Helper methods
  showFieldError(fieldName, message) {
    const field = document.querySelector(`input[name="${fieldName}"], input[id="${fieldName}"]`);
    const errorElement = document.querySelector(`#${fieldName}-error`);
    
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
    const field = document.querySelector(`input[name="${fieldName}"], input[id="${fieldName}"]`);
    const errorElement = document.querySelector(`#${fieldName}-error`);
    
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
    
    // Focar no primeiro campo com erro
    const firstErrorField = document.querySelector('.form-input.error');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }
  
  togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const input = button.closest('.input-wrapper, .password-input-container').querySelector('input');
    
    if (input.type === 'password') {
      input.type = 'text';
      button.setAttribute('aria-label', 'Ocultar senha');
    } else {
      input.type = 'password';
      button.setAttribute('aria-label', 'Mostrar senha');
    }
    
    // Manter foco no input
    input.focus();
  }
  
  showLoading(message = 'Carregando...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      const messageElement = overlay.querySelector('p, .loading-text');
      if (messageElement) {
        messageElement.textContent = message;
      }
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
    }
  }
  
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }
  
  showError(message) {
    this.showAlert(message, 'error');
  }
  
  showSuccess(message) {
    this.showAlert(message, 'success');
  }
  
  showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      const iconSvg = type === 'error' 
        ? `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
           <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
        : `<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
           <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      
      alertContainer.innerHTML = `
        <div class="alert alert-${type}" role="alert">
          <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            ${iconSvg}
          </svg>
          <span>${message}</span>
        </div>
      `;
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 5000);
    }
  }
  
  // Debounce utility
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Auto-fill remembered user
  autoFillRememberedUser() {
    const rememberedEmail = localStorage.getItem('azzo_remember_email');
    const emailField = document.querySelector('input[name="email"], input[id="email"]');
    
    if (rememberedEmail && emailField) {
      emailField.value = rememberedEmail;
      const rememberCheckbox = document.querySelector('input[name="remember"]');
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
  }
}

// Inicializar o gerenciador de autenticação
const localAuthManager = new LocalStorageAuthManager();

// Auto-fill remembered user na página de login
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('login')) {
    localAuthManager.autoFillRememberedUser();
  }
  
  // Verificar timeout de sessão em páginas protegidas
  if (localAuthManager.isLoggedIn()) {
    localAuthManager.checkAuthState();
  }
});

// Exportar para uso global
window.localAuthManager = localAuthManager;
