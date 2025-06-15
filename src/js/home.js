// Home Page JavaScript - Azzo Platform
'use strict';

class HomePageManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupHeader();
    this.setupMobileMenu();
    this.setupThemeToggle();
    this.setupAnimations();
    this.setupCounters();
    this.setupParticles();
    this.setupSearch();
    this.setupScrollEffects();
    this.setupLazyLoading();
  }

  setupHeader() {
    const header = utils.$('#header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Hide header on scroll down, show on scroll up
      if (scrollY > lastScrollY && scrollY > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  setupMobileMenu() {
    const toggle = utils.$('#mobile-menu-toggle');
    const menu = utils.$('#mobile-menu');
    
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('active');
      
      if (isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    // Close menu when clicking on links
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  openMobileMenu() {
    const toggle = utils.$('#mobile-menu-toggle');
    const menu = utils.$('#mobile-menu');
    
    toggle.classList.add('active');
    menu.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    utils.a11y.trapFocus(menu);
  }

  closeMobileMenu() {
    const toggle = utils.$('#mobile-menu-toggle');
    const menu = utils.$('#mobile-menu');
    
    toggle.classList.remove('active');
    menu.classList.remove('active');
    document.body.style.overflow = '';
  }

  setupThemeToggle() {
    const toggle = utils.$('#theme-toggle');
    if (!toggle) return;

    const sunIcon = toggle.querySelector('.sun-icon');
    const moonIcon = toggle.querySelector('.moon-icon');

    const updateThemeIcon = (theme) => {
      if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    };

    // Set initial icon
    updateThemeIcon(utils.theme.get());

    toggle.addEventListener('click', () => {
      const newTheme = utils.theme.toggle();
      updateThemeIcon(newTheme);
      
      // Add rotation animation
      toggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 300);
    });
  }

  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = utils.$$('.animate-on-scroll, .course-card, .feature-card');
    animatedElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });

    // Add staggered animation delays
    const courseCards = utils.$$('.course-card');
    courseCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });

    const featureCards = utils.$$('.feature-card');
    featureCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.2}s`;
    });
  }

  setupCounters() {
    const counters = utils.$$('.stat-number[data-count]');
    
    const animateCounter = (element) => {
      const target = parseInt(element.dataset.count);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      };

      updateCounter();
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  setupParticles() {
    const particlesContainer = utils.$('#particles');
    if (!particlesContainer) return;

    // Simple particle system
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        animation: float-particle 20s linear infinite;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 20}s;
      `;
      return particle;
    };

    // Create particles
    for (let i = 0; i < 50; i++) {
      particlesContainer.appendChild(createParticle());
    }

    // Add particle animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-particle {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupSearch() {
    const searchInputs = utils.$$('.search-input');
    
    searchInputs.forEach(input => {
      let searchTimeout;

      input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) return;

        searchTimeout = setTimeout(() => {
          this.performSearch(query);
        }, 300);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = e.target.value.trim();
          if (query) {
            this.performSearch(query);
          }
        }
      });
    });
  }

  performSearch(query) {
    // Simple search implementation
    console.log('Searching for:', query);
    
    // Here you would typically make an API call
    // For now, we'll just redirect to a search page
    if (query.toLowerCase().includes('python')) {
      window.location.href = 'Python.html';
    } else if (query.toLowerCase().includes('java')) {
      window.location.href = 'Java.html';
    } else if (query.toLowerCase().includes('programação') || query.toLowerCase().includes('programacao')) {
      window.location.href = 'Programaçao.html';
    } else {
      utils.showAlert(`Buscando por: "${query}"`, 'info');
    }
  }

  setupScrollEffects() {
    // Parallax effect for hero section
    const hero = utils.$('.hero');
    if (!hero) return;

    const handleParallax = utils.throttle(() => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;
      
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }, 16);

    window.addEventListener('scroll', handleParallax, { passive: true });

    // Smooth scrolling for anchor links
    const anchorLinks = utils.$$('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = utils.$(`#${targetId}`);
        
        if (targetElement) {
          utils.scrollToElement(targetElement, 80);
        }
      });
    });
  }

  setupLazyLoading() {
    // Lazy load images
    const images = utils.$$('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.src; // Trigger loading
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.src;
      });
    }
  }

  // Video modal functionality
  setupVideoModal() {
    const videoButtons = utils.$$('.play-video');
    
    videoButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const videoId = button.dataset.video;
        this.openVideoModal(videoId);
      });
    });
  }

  openVideoModal(videoId) {
    // Create modal HTML
    const modalHTML = `
      <div class="video-modal" id="video-modal">
        <div class="video-modal-backdrop"></div>
        <div class="video-modal-content">
          <button class="video-modal-close" aria-label="Fechar vídeo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="video-container">
            <video controls autoplay>
              <source src="assets/videos/${videoId}.mp4" type="video/mp4">
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = utils.$('#video-modal');
    const closeBtn = modal.querySelector('.video-modal-close');
    const backdrop = modal.querySelector('.video-modal-backdrop');
    
    // Close modal events
    closeBtn.addEventListener('click', () => this.closeVideoModal());
    backdrop.addEventListener('click', () => this.closeVideoModal());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeVideoModal();
      }
    });

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  closeVideoModal() {
    const modal = utils.$('#video-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  // Performance optimizations
  preloadCriticalResources() {
    // Preload next page resources
    const criticalPages = ['login-new.html', 'Cadastro.html', 'Programaçao.html'];
    
    criticalPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }

  // Analytics and tracking
  trackUserInteractions() {
    // Track button clicks
    const buttons = utils.$$('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const buttonText = e.target.textContent.trim();
        console.log('Button clicked:', buttonText);
        // Here you would send data to your analytics service
      });
    });

    // Track course card interactions
    const courseCards = utils.$$('.course-card');
    courseCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const courseTitle = card.querySelector('.card-title')?.textContent;
        console.log('Course card clicked:', courseTitle);
      });
    });
  }
}

// Initialize home page manager
let homePageManager;

document.addEventListener('DOMContentLoaded', () => {
  homePageManager = new HomePageManager();
  
  // Setup video modal
  homePageManager.setupVideoModal();
  
  // Preload resources
  homePageManager.preloadCriticalResources();
  
  // Track interactions
  homePageManager.trackUserInteractions();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when tab is not visible
    utils.$$('.particle').forEach(particle => {
      particle.style.animationPlayState = 'paused';
    });
  } else {
    // Resume animations when tab becomes visible
    utils.$$('.particle').forEach(particle => {
      particle.style.animationPlayState = 'running';
    });
  }
});

// Handle resize events
window.addEventListener('resize', utils.debounce(() => {
  // Recalculate animations if needed
  if (homePageManager) {
    // Add any resize-specific logic here
  }
}, 250));

// Add CSS for video modal
const videoModalStyles = `
<style>
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.video-modal.active {
  opacity: 1;
  visibility: visible;
}

.video-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
}

.video-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.video-modal.active .video-modal-content {
  transform: scale(1);
}

.video-modal-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  color: var(--white);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease;
}

.video-modal-close:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .video-modal-content {
    max-width: 95vw;
    max-height: 80vh;
  }
  
  .video-container {
    max-width: 100%;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', videoModalStyles);
