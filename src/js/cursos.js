/**
 * Cursos JavaScript - Azzo Platform
 * Funcionalidades: Filtros, busca, visualizações e interações
 */

class CursosManager {
  constructor() {
    this.coursesGrid = document.getElementById('courses-grid');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.viewButtons = document.querySelectorAll('.view-btn');
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.loadMoreBtn = document.getElementById('load-more');
    
    this.currentFilter = 'all';
    this.currentView = 'grid';
    this.isSearching = false;
    this.loadedCourses = 6;
    this.totalCourses = 12;
    
    this.courses = this.getCourseData();
    this.favorites = this.getFavorites();
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupLazyLoading();
    this.setupKeyboardNavigation();
    this.setupEnhancedNavigation();
    this.setupAdvancedHeader();
    this.setupGestureSupport();
    this.trackPageView();
  }

  getCourseData() {
    // Mock course data - in a real app, this would come from an API
    return [
      {
        id: 1,
        title: 'Curso Completo de Python',
        description: 'Aprenda Python do zero ao avançado. Ideal para iniciantes e profissionais que querem dominar a linguagem mais versátil do mercado.',
        level: 'beginner',
        category: 'python',
        duration: '40h',
        price: 39.90,
        rating: 4.9,
        reviews: 2100,
        image: 'assets/imagens/python logo.jpg',
        features: ['Projetos práticos', 'Certificado reconhecido', 'Suporte vitalício'],
        badge: 'Mais Popular',
        link: 'Python.html'
      },
      {
        id: 2,
        title: 'Curso Completo de Java',
        description: 'Domine Java e programação orientada a objetos. Aprenda a criar aplicações robustas e escaláveis.',
        level: 'intermediate',
        category: 'java',
        duration: '60h',
        price: 39.90,
        rating: 4.7,
        reviews: 1800,
        image: 'assets/imagens/java logo.jpg',
        features: ['Spring Boot', 'APIs REST', 'Banco de Dados'],
        link: 'Java.html'
      },
      // Add more courses as needed
    ];
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem('azzo_favorites') || '[]');
  }

  saveFavorites() {
    localStorage.setItem('azzo_favorites', JSON.stringify(this.favorites));
  }

  bindEvents() {
    // Filter tabs
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => this.handleFilterChange(tab));
    });

    // View toggle
    this.viewButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleViewChange(btn));
    });

    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', debounce(() => {
        this.handleSearch();
      }, 300));

      this.searchInput.addEventListener('focus', () => {
        this.showSearchResults();
      });

      // Close search on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
          this.hideSearchResults();
        }
      });
    }

    // Load more
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => this.loadMoreCourses());
    }

    // Course interactions
    this.bindCourseEvents();

    // Mobile menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileToggle?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileToggle.classList.toggle('active');
      
      // Update aria-expanded
      const expanded = !mobileMenu.classList.contains('hidden');
      mobileToggle.setAttribute('aria-expanded', expanded);
    });

    // Header scroll effect
    let lastScrollY = window.scrollY;
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Hide/show header on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      
      lastScrollY = currentScrollY;
    });

    // Navigation dropdown
    const navDropdowns = document.querySelectorAll('.nav-dropdown');
    navDropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-trigger');
      const content = dropdown.querySelector('.nav-dropdown-content');
      
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = dropdown.classList.contains('open');
        
        // Close all dropdowns
        navDropdowns.forEach(d => d.classList.remove('open'));
        
        if (!isOpen) {
          dropdown.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        } else {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  bindCourseEvents() {
    // Favorite buttons
    document.addEventListener('click', (e) => {
      const favoriteBtn = e.target.closest('.favorite');
      if (favoriteBtn) {
        e.preventDefault();
        this.toggleFavorite(favoriteBtn);
      }
    });

    // Share buttons
    document.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.share');
      if (shareBtn) {
        e.preventDefault();
        this.shareCourse(shareBtn);
      }
    });

    // Course card clicks (analytics)
    document.addEventListener('click', (e) => {
      const courseCard = e.target.closest('.course-card');
      if (courseCard && e.target.closest('a')) {
        this.trackCourseClick(courseCard);
      }
    });
  }

  handleFilterChange(tab) {
    // Update active tab
    this.filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    this.currentFilter = tab.dataset.filter;
    this.filterCourses();
    
    // Track filter usage
    this.trackEvent('filter_used', { filter: this.currentFilter });
  }

  handleViewChange(btn) {
    // Update active view
    this.viewButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    this.currentView = btn.dataset.view;
    this.updateView();
    
    // Track view change
    this.trackEvent('view_changed', { view: this.currentView });
  }

  filterCourses() {
    const cards = document.querySelectorAll('.course-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const level = card.dataset.level;
      const shouldShow = this.currentFilter === 'all' || level === this.currentFilter;
      
      if (shouldShow) {
        card.style.display = 'block';
        // Animate in
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, visibleCount * 100);
        visibleCount++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
    
    // Update results count
    this.updateResultsCount(visibleCount);
  }

  updateView() {
    if (this.currentView === 'list') {
      this.coursesGrid.classList.add('list-view');
    } else {
      this.coursesGrid.classList.remove('list-view');
    }
  }

  handleSearch() {
    const query = this.searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
      this.hideSearchResults();
      this.isSearching = false;
      this.filterCourses();
      return;
    }
    
    if (query.length < 2) return;
    
    this.isSearching = true;
    this.showSearchResults();
    
    // Mock search results
    const results = [
      { title: 'Curso de Python', category: 'Programação', link: 'Python.html' },
      { title: 'Curso de Java', category: 'Programação', link: 'Java.html' },
      { title: 'Desenvolvimento Frontend', category: 'Programação', link: 'Frontend.html' }
    ].filter(result => 
      result.title.toLowerCase().includes(query) ||
      result.category.toLowerCase().includes(query)
    );
    
    this.displaySearchResults(results, query);
    
    // Track search
    this.trackEvent('search_performed', { query, results_count: results.length });
  }

  showSearchResults() {
    if (this.searchResults) {
      this.searchResults.classList.add('show');
    }
  }

  hideSearchResults() {
    if (this.searchResults) {
      this.searchResults.classList.remove('show');
    }
  }

  displaySearchResults(results, query) {
    if (!this.searchResults) return;
    
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-no-results">
          <p>Nenhum resultado encontrado para "${escapeHtml(query)}"</p>
          <p class="search-suggestion">Tente termos como "Python", "Java" ou "Frontend"</p>
        </div>
      `;
      return;
    }
    
    const resultsHTML = results.map(result => `
      <a href="${result.link}" class="search-result-item">
        <div class="search-result-title">${highlightText(result.title, query)}</div>
        <div class="search-result-category">${result.category}</div>
      </a>
    `).join('');
    
    this.searchResults.innerHTML = `
      <div class="search-results-header">
        <span class="search-results-count">${results.length} resultado${results.length !== 1 ? 's' : ''}</span>
      </div>
      ${resultsHTML}
    `;
  }

  loadMoreCourses() {
    if (this.loadedCourses >= this.totalCourses) return;
    
    // Show loading state
    this.loadMoreBtn.classList.add('loading');
    this.loadMoreBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loadedCourses += 3;
      
      // Hide button if all courses loaded
      if (this.loadedCourses >= this.totalCourses) {
        this.loadMoreBtn.style.display = 'none';
      } else {
        this.loadMoreBtn.classList.remove('loading');
        this.loadMoreBtn.disabled = false;
      }
      
      this.trackEvent('load_more_courses', { loaded: this.loadedCourses });
    }, 1000);
  }

  toggleFavorite(btn) {
    const courseCard = btn.closest('.course-card');
    const courseId = courseCard.dataset.courseId || courseCard.querySelector('.course-title').textContent;
    
    const isFavorite = this.favorites.includes(courseId);
    
    if (isFavorite) {
      this.favorites = this.favorites.filter(id => id !== courseId);
      btn.classList.remove('favorited');
      btn.setAttribute('aria-label', 'Favoritar curso');
    } else {
      this.favorites.push(courseId);
      btn.classList.add('favorited');
      btn.setAttribute('aria-label', 'Remover dos favoritos');
      
      // Show feedback
      this.showNotification('Curso adicionado aos favoritos!', 'success');
    }
    
    this.saveFavorites();
    this.trackEvent('favorite_toggled', { course_id: courseId, action: isFavorite ? 'remove' : 'add' });
  }

  async shareCourse(btn) {
    const courseCard = btn.closest('.course-card');
    const courseTitle = courseCard.querySelector('.course-title').textContent;
    const courseUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseTitle,
          text: `Confira este curso incrível: ${courseTitle}`,
          url: courseUrl
        });
        
        this.trackEvent('course_shared', { method: 'native', course: courseTitle });
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.fallbackShare(courseTitle, courseUrl);
        }
      }
    } else {
      this.fallbackShare(courseTitle, courseUrl);
    }
  }

  fallbackShare(title, url) {
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification('Link copiado para a área de transferência!', 'success');
        this.trackEvent('course_shared', { method: 'clipboard', course: title });
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.showNotification('Link copiado!', 'success');
      this.trackEvent('course_shared', { method: 'fallback', course: title });
    }
  }

  setupLazyLoading() {
    // Intersection Observer for lazy loading images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  setupKeyboardNavigation() {
    // Course cards keyboard navigation
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach((card, index) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && index < courseCards.length - 1) {
          courseCards[index + 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
          courseCards[index - 1].focus();
        }
      });
    });

    // Filter tabs keyboard navigation
    this.filterTabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && index < this.filterTabs.length - 1) {
          this.filterTabs[index + 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
          this.filterTabs[index - 1].focus();
        }
      });
    });
  }

  updateResultsCount(count) {
    // Update results count display if exists
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
      resultsCount.textContent = `${count} curso${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
  }

  trackCourseClick(courseCard) {
    const courseTitle = courseCard.querySelector('.course-title').textContent;
    this.trackEvent('course_clicked', { course: courseTitle });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${escapeHtml(message)}</span>
        <button class="notification-close" aria-label="Fechar notificação">×</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.remove();
    }, 4000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }

  trackEvent(eventName, properties = {}) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    
    // Console log for development
    console.log('Event tracked:', eventName, properties);
  }

  trackPageView() {
    this.trackEvent('page_view', {
      page: 'cursos',
      category: this.getCategoryFromUrl()
    });
  }

  getCategoryFromUrl() {
    const path = window.location.pathname;
    if (path.includes('programacao')) return 'programacao';
    if (path.includes('desenvolvimento')) return 'desenvolvimento-pessoal';
    if (path.includes('marketing')) return 'marketing';
    return 'geral';
  }

  /**
   * Enhanced Navigation Menu Management
   */
  setupEnhancedNavigation() {
    // Desktop dropdown menus
    this.setupDesktopDropdowns();
    
    // Mobile menu functionality
    this.setupMobileMenu();
    
    // Search functionality
    this.setupSearchFunctionality();
  }

  setupDesktopDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-trigger');
      const content = dropdown.querySelector('.nav-dropdown-content');
      let timeout;

      if (!trigger || !content) return;

      // Hover to open
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('data-open', 'true');
      });

      // Hover to close (with delay)
      dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
          trigger.setAttribute('aria-expanded', 'false');
          dropdown.setAttribute('data-open', 'false');
        }, 150);
      });

      // Click to toggle (for touch devices)
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        
        // Close all other dropdowns
        dropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            const otherTrigger = otherDropdown.querySelector('.nav-trigger');
            if (otherTrigger) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherDropdown.setAttribute('data-open', 'false');
            }
          }
        });

        // Toggle current dropdown
        trigger.setAttribute('aria-expanded', !isOpen);
        dropdown.setAttribute('data-open', !isOpen);
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        } else if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          dropdown.setAttribute('data-open', 'false');
          trigger.focus();
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        dropdowns.forEach(dropdown => {
          const trigger = dropdown.querySelector('.nav-trigger');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.setAttribute('data-open', 'false');
          }
        });
      }
    });
  }

  setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');

    if (!mobileMenuToggle || !mobileMenu) return;

    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      
      if (isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    });

    // Setup submenu toggles
    mobileNavToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const section = toggle.getAttribute('data-section');
        const submenu = document.getElementById(`mobile-${section}`);
        
        if (!submenu) return;

        const isActive = toggle.classList.contains('active');
        
        // Close all other submenus
        mobileNavToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.classList.remove('active');
            const otherSection = otherToggle.getAttribute('data-section');
            const otherSubmenu = document.getElementById(`mobile-${otherSection}`);
            if (otherSubmenu) {
              otherSubmenu.classList.remove('active');
            }
          }
        });

        // Toggle current submenu
        if (isActive) {
          toggle.classList.remove('active');
          submenu.classList.remove('active');
        } else {
          toggle.classList.add('active');
          submenu.classList.add('active');
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-toggle')) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });
  }

  openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (mobileMenu && mobileMenuToggle) {
      mobileMenu.classList.remove('hidden');
      mobileMenuToggle.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element
      const firstFocusable = mobileMenu.querySelector('input, button, a');
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');
    
    if (mobileMenu && mobileMenuToggle) {
      mobileMenu.classList.add('hidden');
      mobileMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
      
      // Close all submenus
      mobileNavToggles.forEach(toggle => {
        toggle.classList.remove('active');
        const section = toggle.getAttribute('data-section');
        const submenu = document.getElementById(`mobile-${section}`);
        if (submenu) {
          submenu.classList.remove('active');
        }
      });
    }
  }

  setupSearchFunctionality() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchButtons = document.querySelectorAll('.search-button');
    
    searchInputs.forEach(input => {
      input.addEventListener('input', this.debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          this.performSearch(query);
        } else {
          this.clearSearchResults();
        }
      }, 300));

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

    searchButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const searchForm = button.closest('.search-form') || button.closest('.search-container');
        const input = searchForm?.querySelector('.search-input');
        const query = input?.value.trim();
        
        if (query) {
          this.performSearch(query);
        }
      });
    });
  }

  performSearch(query) {
    // Filter courses based on search query
    const filteredCourses = this.courses.filter(course => 
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase()) ||
      course.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
    );

    // Update display
    this.displayCourses(filteredCourses);
    this.isSearching = true;

    // Update search results indicator
    this.updateSearchResults(query, filteredCourses.length);

    // Track search
    this.trackEvent('search', {
      query: query,
      results: filteredCourses.length
    });
  }

  clearSearchResults() {
    if (this.isSearching) {
      this.displayCourses(this.getFilteredCourses());
      this.isSearching = false;
      
      const searchResults = document.getElementById('search-results');
      if (searchResults) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
      }
    }
  }

  updateSearchResults(query, count) {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="search-results-info">
          <strong>${count}</strong> resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''} para "<em>${query}</em>"
          <button class="clear-search" aria-label="Limpar busca">×</button>
        </div>
      `;
      searchResults.style.display = 'block';

      // Add clear search functionality
      const clearButton = searchResults.querySelector('.clear-search');
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          document.querySelectorAll('.search-input').forEach(input => {
            input.value = '';
          });
          this.clearSearchResults();
        });
      }
    }
  }

  /**
   * Utility function for debouncing - moved to class for this reference
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Display courses with filtering and search
   */
  displayCourses(courses) {
    if (!this.coursesGrid) return;
    
    // In a real implementation, this would update the DOM with filtered courses
    // For now, we'll work with existing static HTML
    const cards = document.querySelectorAll('.course-card');
    cards.forEach(card => {
      card.style.display = 'block';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  /**
   * Get filtered courses based on current filter
   */
  getFilteredCourses() {
    if (this.currentFilter === 'all') {
      return this.courses;
    }
    
    return this.courses.filter(course => course.level === this.currentFilter);
  }

  /**
   * Enhanced Header Management with Advanced Features
   */
  setupAdvancedHeader() {
    this.setupScrollEffects();
    this.setupSmartSearch();
    this.setupKeyboardShortcuts();
    this.setupHeaderThemeToggle();
    this.setupNotificationSystem();
  }

  setupScrollEffects() {
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    const header = document.getElementById('header');
    
    if (!header) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      
      // Add scrolled class for styling
      if (currentScrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Smart header hiding
      if (scrollDelta > 10) {
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          // Scrolling down
          header.classList.add('hidden');
          this.closeAllDropdowns();
        } else {
          // Scrolling up
          header.classList.remove('hidden');
        }
        lastScrollY = currentScrollY;
      }
      
      // Clear timeout and set new one
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        header.classList.remove('hidden');
      }, 1000);
    };

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  setupSmartSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchResults = document.getElementById('search-results');
    let searchCache = new Map();
    let searchController = null;

    searchInputs.forEach(input => {
      // Smart search with caching and debouncing
      input.addEventListener('input', this.debounce(async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
          this.hideSearchResults();
          return;
        }

        // Check cache first
        if (searchCache.has(query)) {
          this.displaySearchResults(searchCache.get(query), query);
          return;
        }

        // Cancel previous request
        if (searchController) {
          searchController.abort();
        }

        // Create new AbortController
        searchController = new AbortController();

        try {
          // Show loading state
          this.showSearchLoading();

          // Simulate API call with mock data
          const results = await this.performAdvancedSearch(query, searchController.signal);
          
          // Cache results
          searchCache.set(query, results);
          
          // Display results
          this.displaySearchResults(results, query);
          
          // Track search
          this.trackEvent('advanced_search', {
            query: query,
            results: results.length,
            cached: false
          });

        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Search error:', error);
            this.showSearchError();
          }
        }
      }, 300));

      // Quick search shortcuts
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = e.target.value.trim();
          if (query) {
            this.executeSearch(query);
          }
        } else if (e.key === 'Escape') {
          this.hideSearchResults();
          input.blur();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.focusFirstSearchResult();
        }
      });

      // Search focus management
      input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
          this.showSearchResults();
        }
      });
    });

    // Click outside to close search
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSearchResults();
      }
    });
  }

  async performAdvancedSearch(query, signal) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (signal.aborted) {
      throw new DOMException('Search aborted', 'AbortError');
    }

    // Enhanced mock search results with categories
    const allResults = [
      { title: 'Curso Completo de Python', category: 'Programação', type: 'course', link: 'Python.html', popularity: 95 },
      { title: 'Java para Iniciantes', category: 'Programação', type: 'course', link: 'Java.html', popularity: 88 },
      { title: 'Desenvolvimento Frontend', category: 'Programação', type: 'course', link: 'Frontend.html', popularity: 92 },
      { title: 'Backend com Node.js', category: 'Programação', type: 'course', link: 'Backend.html', popularity: 85 },
      { title: 'C# e .NET Core', category: 'Programação', type: 'course', link: 'Csharp.html', popularity: 80 },
      { title: 'Programação em C', category: 'Programação', type: 'course', link: 'C.html', popularity: 75 },
      { title: 'Liderança e Gestão', category: 'Desenvolvimento Pessoal', type: 'course', link: 'desenvolvimentopessoal.html', popularity: 70 },
      { title: 'Marketing Digital', category: 'Marketing', type: 'course', link: 'marketing.html', popularity: 82 }
    ];

    const results = allResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => b.popularity - a.popularity);

    return results;
  }

  showSearchLoading() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="search-loading">
          <div class="search-spinner"></div>
          <span>Pesquisando...</span>
        </div>
      `;
      searchResults.classList.add('show');
    }
  }

  showSearchError() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="search-error">
          <span>Erro na pesquisa. Tente novamente.</span>
        </div>
      `;
      searchResults.classList.add('show');
    }
  }

  focusFirstSearchResult() {
    const firstResult = document.querySelector('.search-result-item');
    if (firstResult) {
      firstResult.focus();
    }
  }

  executeSearch(query) {
    // Redirect to search results page or filter current page
    window.location.href = `programacao-new.html?search=${encodeURIComponent(query)}`;
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Escape to close all dropdowns and menus
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
        this.closeMobileMenu();
        this.hideSearchResults();
      }
      
      // Alt + M to toggle mobile menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
          mobileToggle.click();
        }
      }
    });
  }

  setupHeaderThemeToggle() {
    // Add theme toggle button to header if not exists
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('theme-toggle')) {
      const themeToggle = document.createElement('button');
      themeToggle.id = 'theme-toggle';
      themeToggle.className = 'theme-toggle-btn';
      themeToggle.innerHTML = `
        <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
      themeToggle.setAttribute('aria-label', 'Alternar tema');
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
      
      // Insert before auth buttons
      const authButtons = headerRight.querySelector('.auth-buttons');
      if (authButtons) {
        headerRight.insertBefore(themeToggle, authButtons);
      } else {
        headerRight.appendChild(themeToggle);
      }
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', 
        newTheme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'
      );
    }
    
    this.trackEvent('theme_changed', { theme: newTheme });
  }

  setupNotificationSystem() {
    // Initialize notification container
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  showAdvancedNotification(message, type = 'info', duration = 4000, actions = []) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const actionsHTML = actions.length > 0 ? `
      <div class="notification-actions">
        ${actions.map(action => `
          <button class="notification-action" data-action="${action.id}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    ` : '';

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-message">${this.escapeHtml(message)}</div>
        ${actionsHTML}
        <button class="notification-close" aria-label="Fechar notificação">×</button>
      </div>
    `;

    // Add event listeners
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.removeNotification(notification));

    // Add action listeners
    actions.forEach(action => {
      const actionBtn = notification.querySelector(`[data-action="${action.id}"]`);
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          action.callback();
          this.removeNotification(notification);
        });
      }
    });

    // Add to container
    container.appendChild(notification);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }

    return notification;
  }

  removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-trigger');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('data-open', 'false');
      }
    });
  }

  /**
   * Enhanced Mobile Menu with Gestures
   */
  setupGestureSupport() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      this.handleGesture();
    });
  }

  handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // Swipe right to open mobile menu (from left edge)
    if (deltaX > minSwipeDistance && Math.abs(deltaY) < 100 && touchStartX < 50) {
      this.openMobileMenu();
    }
    
    // Swipe left to close mobile menu
    if (deltaX < -minSwipeDistance && Math.abs(deltaY) < 100) {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        this.closeMobileMenu();
      }
    }
  }
  
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Utility functions
function debounce(func, wait) {
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

function highlightText(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cursosManager = new CursosManager();
});

// Performance monitoring
window.addEventListener('load', () => {
  // Track page load performance
  const perfData = performance.getEntriesByType('navigation')[0];
  if (perfData) {
    console.log('Cursos page loaded in:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CursosManager };
}
