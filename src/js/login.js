// Login Page Specific JavaScript - Azzo Platform
'use strict';

class LoginPageManager {
  constructor() {
    this.phrases = [
      'Transforme seu futuro hoje',
      'Aprenda com os melhores especialistas',
      'Conquiste suas metas profissionais',
      'Evolua sua carreira conosco',
      'Conhecimento que transforma vidas',
      'Sua jornada de sucesso começa aqui'
    ];
    
    this.currentPhraseIndex = 0;
    this.phraseInterval = null;
    
    this.init();
  }
  
  init() {
    this.setupAnimatedPhrases();
    this.setupFormEnhancements();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
    
    // Start animations after page load
    window.addEventListener('load', () => {
      this.startAnimations();
    });
  }
  
  setupAnimatedPhrases() {
    const phraseElement = utils.$('#dynamic-phrase');
    if (!phraseElement) return;
    
    // Start phrase rotation
    this.phraseInterval = setInterval(() => {
      this.rotatePhrases(phraseElement);
    }, 4000);
    
    // Pause on hover
    phraseElement.addEventListener('mouseenter', () => {
      clearInterval(this.phraseInterval);
    });
    
    phraseElement.addEventListener('mouseleave', () => {
      this.phraseInterval = setInterval(() => {
        this.rotatePhrases(phraseElement);
      }, 4000);
    });
  }
  
  rotatePhrases(element) {
    // Fade out current phrase
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      // Change text
      this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
      element.textContent = this.phrases[this.currentPhraseIndex];
      
      // Fade in new phrase
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 300);
  }
  
  setupFormEnhancements() {
    this.setupInputAnimations();
    this.setupFormValidation();
    this.setupPasswordStrength();
    this.setupSocialLogin();
  }
  
  setupInputAnimations() {
    const inputs = utils.$$('.form-input');
    
    inputs.forEach(input => {
      // Add floating label effect
      const wrapper = input.closest('.input-wrapper');
      if (!wrapper) return;
      
      // Focus animations
      input.addEventListener('focus', () => {
        wrapper.classList.add('focused');
        this.animateInputFocus(input);
      });
      
      input.addEventListener('blur', () => {
        wrapper.classList.remove('focused');
        if (!input.value.trim()) {
          wrapper.classList.remove('filled');
        } else {
          wrapper.classList.add('filled');
        }
      });
      
      // Check if input has value on load
      if (input.value.trim()) {
        wrapper.classList.add('filled');
      }
      
      // Typing animation
      input.addEventListener('input', utils.throttle(() => {
        this.animateTyping(input);
      }, 100));
    });
  }
  
  animateInputFocus(input) {
    const wrapper = input.closest('.input-wrapper');
    if (!wrapper) return;
    
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'input-ripple';
    wrapper.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  animateTyping(input) {
    // Add typing indicator
    input.classList.add('typing');
    
    // Remove typing indicator after delay
    clearTimeout(input.typingTimeout);
    input.typingTimeout = setTimeout(() => {
      input.classList.remove('typing');
    }, 500);
  }
  
  setupFormValidation() {
    const form = utils.$('.login-form');
    if (!form) return;
    
    // Real-time validation with animations
    const inputs = form.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateFieldWithAnimation(input);
      });
      
      input.addEventListener('input', utils.debounce(() => {
        if (input.classList.contains('error')) {
          this.validateFieldWithAnimation(input);
        }
      }, 300));
    });
  }
  
  validateFieldWithAnimation(input) {
    const isValid = authManager.validateField(input);
    const wrapper = input.closest('.input-wrapper');
    
    if (wrapper) {
      if (isValid) {
        wrapper.classList.remove('error');
        wrapper.classList.add('success');
        this.showSuccessAnimation(input);
      } else {
        wrapper.classList.remove('success');
        wrapper.classList.add('error');
        this.showErrorAnimation(input);
      }
    }
  }
  
  showSuccessAnimation(input) {
    const wrapper = input.closest('.input-wrapper');
    if (!wrapper) return;
    
    // Add success checkmark
    const existingCheck = wrapper.querySelector('.success-check');
    if (existingCheck) existingCheck.remove();
    
    const checkmark = document.createElement('div');
    checkmark.className = 'success-check';
    checkmark.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    wrapper.appendChild(checkmark);
    
    setTimeout(() => {
      checkmark.classList.add('animate');
    }, 10);
  }
  
  showErrorAnimation(input) {
    const wrapper = input.closest('.input-wrapper');
    if (!wrapper) return;
    
    // Remove success indicator
    const successCheck = wrapper.querySelector('.success-check');
    if (successCheck) successCheck.remove();
    
    // Shake animation
    input.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
      input.style.animation = '';
    }, 500);
  }
  
  setupPasswordStrength() {
    const passwordInput = utils.$('input[name="senha"]');
    if (!passwordInput) return;
    
    // Create password strength indicator
    const wrapper = passwordInput.closest('.input-wrapper');
    if (!wrapper) return;
    
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'password-strength';
    strengthMeter.innerHTML = `
      <div class="strength-bars">
        <div class="strength-bar"></div>
        <div class="strength-bar"></div>
        <div class="strength-bar"></div>
        <div class="strength-bar"></div>
      </div>
      <span class="strength-text">Digite uma senha</span>
    `;
    
    wrapper.appendChild(strengthMeter);
    
    passwordInput.addEventListener('input', () => {
      this.updatePasswordStrength(passwordInput.value, strengthMeter);
    });
  }
  
  updatePasswordStrength(password, strengthMeter) {
    const bars = strengthMeter.querySelectorAll('.strength-bar');
    const text = strengthMeter.querySelector('.strength-text');
    
    let strength = 0;
    let strengthText = '';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Update bars
    bars.forEach((bar, index) => {
      bar.classList.toggle('active', index < strength);
    });
    
    // Update text and class
    strengthMeter.className = 'password-strength';
    
    switch (strength) {
      case 0:
      case 1:
        strengthMeter.classList.add('weak');
        strengthText = 'Senha fraca';
        break;
      case 2:
      case 3:
        strengthMeter.classList.add('medium');
        strengthText = 'Senha média';
        break;
      case 4:
      case 5:
        strengthMeter.classList.add('strong');
        strengthText = 'Senha forte';
        break;
    }
    
    text.textContent = strengthText;
  }
  
  setupSocialLogin() {
    const socialButtons = utils.$$('.social-btn');
    
    socialButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSocialLogin(button);
      });
    });
  }
  
  handleSocialLogin(button) {
    const provider = button.textContent.toLowerCase().includes('google') ? 'google' : 'unknown';
    
    utils.setLoadingState(button, true);
    
    // Simulate social login (replace with actual implementation)
    setTimeout(() => {
      utils.setLoadingState(button, false);
      utils.showAlert(`Login com ${provider} será implementado em breve.`, 'info');
    }, 2000);
  }
  
  setupAccessibility() {
    // Keyboard navigation
    this.setupKeyboardNavigation();
    
    // Screen reader announcements
    this.setupScreenReaderSupport();
    
    // High contrast mode support
    this.setupHighContrastMode();
  }
  
  setupKeyboardNavigation() {
    const form = utils.$('.login-form');
    if (!form) return;
    
    // Tab navigation enhancement
    const focusableElements = form.querySelectorAll(
      'input, button, a, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && element.type !== 'submit') {
          e.preventDefault();
          const nextElement = focusableElements[index + 1];
          if (nextElement) {
            nextElement.focus();
          }
        }
      });
    });
  }
  
  setupScreenReaderSupport() {
    // Form submission feedback
    const form = utils.$('.login-form');
    if (!form) return;
    
    form.addEventListener('submit', () => {
      utils.a11y.announceToSR('Processando login, por favor aguarde...');
    });
    
    // Error announcements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('alert')) {
              const message = node.querySelector('.alert-message');
              if (message) {
                utils.a11y.announceToSR(message.textContent);
              }
            }
          });
        }
      });
    });
    
    const alertContainer = utils.$('#alert-container');
    if (alertContainer) {
      observer.observe(alertContainer, { childList: true });
    }
  }
  
  setupHighContrastMode() {
    // Detect high contrast mode
    const supportsHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (supportsHighContrast) {
      document.body.classList.add('high-contrast');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      document.body.classList.toggle('high-contrast', e.matches);
    });
  }
  
  setupPerformanceOptimizations() {
    // Lazy load non-critical resources
    this.lazyLoadResources();
    
    // Optimize animations based on user preferences
    this.optimizeAnimations();
    
    // Preload critical resources
    this.preloadResources();
  }
  
  lazyLoadResources() {
    // Lazy load background images
    const elementsWithBg = utils.$$('[data-bg]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const bgUrl = element.dataset.bg;
          element.style.backgroundImage = `url(${bgUrl})`;
          element.removeAttribute('data-bg');
          imageObserver.unobserve(element);
        }
      });
    });
    
    elementsWithBg.forEach((element) => {
      imageObserver.observe(element);
    });
  }
  
  optimizeAnimations() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
      
      // Stop phrase rotation
      clearInterval(this.phraseInterval);
    }
  }
  
  preloadResources() {
    // Preload next page resources
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'inventáriousuario.html';
    document.head.appendChild(link);
  }
  
  startAnimations() {
    // Trigger entrance animations
    const animatedElements = utils.$$('.fade-in, .slide-in');
    
    animatedElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate');
      }, index * 100);
    });
  }
  
  destroy() {
    // Clean up intervals and observers
    if (this.phraseInterval) {
      clearInterval(this.phraseInterval);
    }
  }
}

// Initialize login page manager
let loginPageManager;

document.addEventListener('DOMContentLoaded', () => {
  loginPageManager = new LoginPageManager();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (loginPageManager) {
    loginPageManager.destroy();
  }
});

// Additional CSS for animations (injected via JavaScript)
const additionalStyles = `
<style>
.input-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.input-wrapper.focused {
  transform: translateY(-2px);
}

.input-wrapper.error {
  animation: shake 0.5s ease-in-out;
}

.input-ripple {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  animation: ripple 0.6s ease-out;
  transform: translateX(-50%);
}

@keyframes ripple {
  to {
    width: 100%;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-input.typing {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.success-check {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--success);
  opacity: 0;
  transition: all 0.3s ease;
}

.success-check.animate {
  opacity: 1;
  animation: checkmark 0.5s ease-in-out;
}

@keyframes checkmark {
  0% {
    transform: translateY(-50%) scale(0);
  }
  50% {
    transform: translateY(-50%) scale(1.2);
  }
  100% {
    transform: translateY(-50%) scale(1);
  }
}

.password-strength {
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.input-wrapper.focused .password-strength {
  opacity: 1;
}

.strength-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.strength-bar {
  height: 4px;
  flex: 1;
  background: var(--gray-300);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.active {
  background: var(--primary-color);
}

.password-strength.weak .strength-bar.active {
  background: var(--error);
}

.password-strength.medium .strength-bar.active {
  background: var(--warning);
}

.password-strength.strong .strength-bar.active {
  background: var(--success);
}

.strength-text {
  font-size: var(--font-xs);
  color: var(--gray-500);
}

.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.high-contrast .form-input {
  border-width: 3px;
}

.high-contrast .form-input:focus {
  border-color: var(--black);
  box-shadow: 0 0 0 3px var(--primary-color);
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);
