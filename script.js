// Global variables
let isMenuOpen = false;
let observers = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Verificar se elementos críticos existem
    if (!document.getElementById('header')) {
        console.warn('Header element not found');
        return;
    }
    
    try {
        initializeHeader();
        initializeScrollEffects();
        initializeAnimations();
        initializeForm();
        initializeScrollToTop();
        initializeHeroAnimations();
        initializeAccessibility();
        initializeLazyLoading();
        initializePerformanceMonitoring();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Header functionality
function initializeHeader() {
    const header = document.getElementById('header');
    
    // Handle scroll effects
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    const mobileNav = document.querySelector('.mobile-nav');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    const body = document.body;
    
    if (isMenuOpen) {
        mobileNav.classList.remove('hidden');
        // Forçar reflow para animação
        mobileNav.offsetHeight;
        mobileNav.classList.add('active');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        body.style.overflow = 'hidden'; // Prevenir scroll
    } else {
        mobileNav.classList.remove('active');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        body.style.overflow = ''; // Restaurar scroll
        
        // Esperar animação terminar antes de esconder
        setTimeout(() => {
            mobileNav.classList.add('hidden');
        }, 300);
    }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (isMenuOpen) {
            toggleMobileMenu();
        }
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

// Initialize scroll-based animations
function initializeAnimations() {
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Delay baseado no tipo de elemento
                let delay = 0;
                
                if (entry.target.classList.contains('area-card')) {
                    const cards = Array.from(document.querySelectorAll('.area-card'));
                    const index = cards.indexOf(entry.target);
                    delay = index * 100;
                } else if (entry.target.classList.contains('about-content')) {
                    delay = 200;
                } else if (entry.target.classList.contains('about-image')) {
                    delay = 300;
                }
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, { 
        threshold: 0.2, // Reduzido para trigger mais cedo
        rootMargin: '0px 0px -50px 0px'
    });

    const animatedElements = [
        '.about-content',
        '.about-image',
        '.areas-header',
        '.area-card',
        '.areas-cta',
        '.contact-header',
        '.contact-form-container',
        '.contact-info',
        '.map-header',
        '.map-container'
    ];

    animatedElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element) {
                animationObserver.observe(element);
            }
        });
    });

    observers.push(animationObserver);
}

// Initialize hero animations
function initializeHeroAnimations() {
    // Trigger hero animations after page load
    setTimeout(() => {
        const heroText = document.querySelector('.hero-text');
        const heroPhoto = document.querySelector('.hero-photo');
        
        if (heroText) {
            heroText.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        }
        
        if (heroPhoto) {
            heroPhoto.style.transition = 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s';
            heroPhoto.style.opacity = '1';
            heroPhoto.style.transform = 'translateY(0)';
        }
    }, 300);
}

// Initialize scroll-to-top button
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        });
    }
}

// Form handling
function initializeForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        
        // Add input event listeners for real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                clearFieldError(this.name);
            });
        });
    }
}

// Handle form submission
// Handle form submission com EmailJS
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');

    // Validação básica
    if (!validateForm(form)) {
        return;
    }

    setFormLoadingState(true);

    try {
        // Prepara os dados para envio
        const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value || 'Não informado',
            message: form.message.value,
            subject: 'Novo Contato - Site Advocacia',
            date: new Date().toLocaleString('pt-BR')
        };

        // Envia o email usando EmailJS
        const response = await emailjs.send(
            'service_b4z92fh',      // ← Substitua pelo seu Service ID
            'template_06vvokt',     // ← Substitua pelo seu Template ID  
            formData
        );

        // Sucesso
        showFormSuccess();
        form.reset();
        setFormLoadingState(false);

    } catch (error) {
        console.error('Erro ao enviar email:', error);
        showFormError('Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente pelo WhatsApp.');
        setFormLoadingState(false);
    }
}

// Form validation
// Função de validação simplificada
function validateForm(form) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Name validation
    const name = form.querySelector('[name="name"]');
    if (!name.value.trim()) {
        showFieldError('name', 'Nome é obrigatório');
        isValid = false;
    }
    
    // Email validation
    const email = form.querySelector('[name="email"]');
    if (!email.value.trim()) {
        showFieldError('email', 'E-mail é obrigatório');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError('email', 'E-mail inválido');
        isValid = false;
    }
    
    // Message validation
    const message = form.querySelector('[name="message"]');
    if (!message.value.trim()) {
        showFieldError('message', 'Mensagem é obrigatória');
        isValid = false;
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
    }
}

// Clear field error
function clearFieldError(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
        field.classList.remove('error');
        errorElement.textContent = '';
    }
}

// Clear all errors
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input, .form-textarea');
    
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// Set form loading state
function setFormLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.querySelector('.submit-icon');
    const submitSpinner = document.querySelector('.submit-spinner');
    const submitText = document.querySelector('.submit-text');
    
    if (submitBtn && submitIcon && submitSpinner && submitText) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitIcon.classList.add('hidden');
            submitSpinner.classList.remove('hidden');
            submitText.textContent = 'Enviando...';
        } else {
            submitBtn.disabled = false;
            submitIcon.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
            submitText.textContent = 'Enviar Mensagem';
        }
    }
}

// Show form success
function showFormSuccess() {
    const successMessage = document.getElementById('success-message');
    
    if (successMessage) {
        successMessage.classList.remove('hidden');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    }
}

// Show form error
function showFormError(message) {
    // You could implement a toast notification or error display here
    alert(message);
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate successful submission
            console.log('Form submitted:', formData);
            resolve();
        }, 2000);
    });
}

// Handle scroll effects for parallax-like animations
function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const decorations = document.querySelectorAll('[class*="hero-decoration-"]');
        
        decorations.forEach((decoration, index) => {
            const speed = 0.1 + (index * 0.02);
            const yPos = scrolled * speed;
            // Usar transform separado para não conflitar com animações CSS
            decoration.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate);
    // Inicializar uma vez
    updateScrollEffects();
}

// Debounce function
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

// Handle window resize
const debouncedResize = debounce(function() {
    if (window.innerWidth >= 768 && isMenuOpen) {
        toggleMobileMenu();
    }
}, 250);

window.addEventListener('resize', debouncedResize);

// Handle escape key for mobile menu
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isMenuOpen) {
        toggleMobileMenu();
    }
});

// Smooth scroll polyfill for older browsers
function smoothScrollPolyfill() {
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Import smooth scroll polyfill for older browsers
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js';
        document.head.appendChild(script);
    }
}

// Initialize smooth scroll polyfill
smoothScrollPolyfill();

// Lazy loading for images (if any are added later)
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        observers.push(imageObserver);
    }
}

// Clean up observers when page unloads
function cleanupObservers() {
    observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
        }
    });
    observers = [];
}

window.addEventListener('beforeunload', cleanupObservers);

// Add focus management for accessibility
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Focus management for mobile menu
    const mobileMenuBtns = document.querySelectorAll('.mobile-nav-btn');
    const mobileMenuToggle = document.querySelector('.mobile-menu-btn');
    
    mobileMenuBtns.forEach((btn, index) => {
        btn.addEventListener('keydown', function(event) {
            if (event.key === 'Tab') {
                if (event.shiftKey && index === 0) {
                    event.preventDefault();
                    mobileMenuToggle.focus();
                } else if (!event.shiftKey && index === mobileMenuBtns.length - 1) {
                    event.preventDefault();
                    mobileMenuToggle.focus();
                }
            }
        });
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function(event) {
    // Handle Enter key on buttons
    if (event.key === 'Enter' && event.target.tagName === 'BUTTON') {
        event.target.click();
    }
    
    // Handle arrow keys for navigation (optional enhancement)
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    const currentIndex = Array.from(navButtons).indexOf(document.activeElement);
    
    if (currentIndex !== -1) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % navButtons.length;
            navButtons[nextIndex].focus();
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const prevIndex = currentIndex === 0 ? navButtons.length - 1 : currentIndex - 1;
            navButtons[prevIndex].focus();
        }
    }
});

// Add print styles optimization
function optimizeForPrint() {
    const printStyles = `
        @media print {
            .header, .scroll-to-top, .mobile-menu-btn { display: none !important; }
            .hero-section { min-height: auto; page-break-after: always; }
            .section { page-break-inside: avoid; }
            * { color-adjust: exact; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
}

// Initialize print optimization
optimizeForPrint();

// Add service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here if needed
        console.log('Service Worker support detected');
    });
}

// Analytics and error tracking initialization (placeholder)
function initializeAnalytics() {
    // Google Analytics or other analytics service initialization would go here
    console.log('Analytics initialized');
}

// Error boundary for JavaScript errors
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    // Error reporting service integration would go here
});

// Initialize analytics
initializeAnalytics();

// Add performance monitoring
function initializePerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    console.log('Page load time:', loadTime + 'ms');
                }
            }, 0);
        });
    }
}

// Initialize performance monitoring
initializePerformanceMonitoring();






