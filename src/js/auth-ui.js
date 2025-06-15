// Auth UI Manager - Azzo Platform
'use strict';

class AuthUIManager {
    constructor() {
        this.authButtons = document.querySelector('.auth-buttons');
        this.mobileAuthButtons = document.querySelector('.mobile-nav-auth');
        this.init();
    }

    init() {
        // Verificar estado de autenticação ao carregar a página
        this.checkAuthState();
        
        // Adicionar listener para mudanças no estado de autenticação
        window.addEventListener('storage', (e) => {
            if (e.key === 'isLoggedIn') {
                this.checkAuthState();
            }
        });
    }

    checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            this.showLoggedInUI();
        } else {
            this.showLoggedOutUI();
        }
    }

    showLoggedInUI() {
        // Atualizar botões de autenticação no desktop
        if (this.authButtons) {
            this.authButtons.innerHTML = `
                <button id="inventory-btn" class="btn btn-outline">
                    <i class="fas fa-book"></i> Meu Inventário
                </button>
                <button id="logout-btn" class="btn btn-primary">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            `;
        }

        // Atualizar botões de autenticação no mobile
        if (this.mobileAuthButtons) {
            this.mobileAuthButtons.innerHTML = `
                <a href="inventáriousuario.html" class="mobile-nav-item auth">
                    <span class="mobile-nav-icon">📚</span>
                    <span class="mobile-nav-text">Meu Inventário</span>
                </a>
                <button id="mobile-logout-btn" class="mobile-nav-item auth primary">
                    <span class="mobile-nav-icon">🚪</span>
                    <span class="mobile-nav-text">Sair</span>
                </button>
            `;
        }

        // Adicionar event listeners para os botões
        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        const inventoryBtn = document.getElementById('inventory-btn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.handleLogout());
        }

        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => {
                window.location.href = 'inventáriousuario.html';
            });
        }

        // Redirecionar se tentar acessar páginas de login/cadastro
        const currentPage = window.location.pathname;
        if (currentPage.includes('login') || currentPage.includes('cadastro')) {
            window.location.href = 'home.html';
        }
    }

    showLoggedOutUI() {
        // Atualizar botões de autenticação no desktop
        if (this.authButtons) {
            this.authButtons.innerHTML = `
                <a href="login-new.html" class="btn btn-outline">Entrar</a>
                <a href="cadastro-new.html" class="btn btn-primary">Começar Agora</a>
            `;
        }

        // Atualizar botões de autenticação no mobile
        if (this.mobileAuthButtons) {
            this.mobileAuthButtons.innerHTML = `
                <a href="login-new.html" class="mobile-nav-item auth">
                    <span class="mobile-nav-icon">🔓</span>
                    <span class="mobile-nav-text">Entrar</span>
                </a>
                <a href="cadastro-new.html" class="mobile-nav-item auth primary">
                    <span class="mobile-nav-icon">🚀</span>
                    <span class="mobile-nav-text">Começar Agora</span>
                </a>
            `;
        }
    }

    handleLogout() {
        // Limpar dados de autenticação
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('userInfo');
        
        // Redirecionar para a página inicial
        window.location.href = 'home.html';
    }
}

// Inicializar o gerenciador de UI de autenticação
document.addEventListener('DOMContentLoaded', () => {
    new AuthUIManager();
}); 