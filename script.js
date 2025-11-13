// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const destinationSections = document.querySelectorAll('.destination-section');
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Configurable buffer for fine-tuning alignment (can adjust to 0..10 as desired)
    const SCROLL_BUFFER = 4; // pixels between navbar bottom and destination title

    // Helper to get the vertical position of a section's header (destination title)
    function getSectionHeaderTop(section) {
        if (!section) return 0;
        const header = section.querySelector('.destination-header');
        if (header) {
            return header.getBoundingClientRect().top + window.pageYOffset;
        }
        return section.getBoundingClientRect().top + window.pageYOffset;
    }

    // Simplified precise scrolling leveraging CSS scroll-margin-top
    function scrollToSection(section, behavior = 'smooth') {
        if (!section) return;
        const header = section.querySelector('.destination-header') || section;
        header.scrollIntoView({ behavior, block: 'start' });
        // Post-adjust refinement if fonts reflow; run a couple frames
        let attempts = 0;
        function refine() {
            attempts++;
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const headerRect = header.getBoundingClientRect();
            // If header is obscured by navbar, nudge downward
            if (headerRect.top < navHeight + SCROLL_BUFFER && attempts < 4) {
                window.scrollBy({ top: headerRect.top - (navHeight + SCROLL_BUFFER), behavior: 'auto' });
                requestAnimationFrame(refine);
            }
        }
        requestAnimationFrame(refine);
    }

    // Smooth scrolling for navigation links (accurate to section title)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            scrollToSection(targetSection);
        });
    });

    // Smooth scrolling for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            scrollToSection(document.querySelector(targetId));
        });
    }

    // Create scroll progress indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    // Navbar scroll effects and active link highlighting
    function handleScroll() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        // Update scroll progress indicator
        const scrollPercent = (scrollTop / (docHeight - windowHeight)) * 100;
        scrollIndicator.style.width = scrollPercent + '%';
        
        // Add background to navbar when scrolling
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        // Highlight active navigation link
        let current = '';
        const navHeight = navbar ? navbar.offsetHeight : 0;
        destinationSections.forEach(section => {
            const headerTop = getSectionHeaderTop(section) - navHeight - 20; // early highlight before exact alignment
            const sectionHeight = section.clientHeight;
            if (scrollTop >= headerTop && scrollTop < headerTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });

        // Animate destination sections on scroll
        destinationSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const windowBottom = scrollTop + windowHeight;
            
            if (windowBottom > sectionTop + 120) {
                section.classList.add('animate');
            }
        });
    }

    // Throttled scroll handler for better performance
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }

    window.addEventListener('scroll', function() {
        requestTick();
        ticking = false;
    });

    // Initialize animations for visible sections
    handleScroll();

    // Intersection Observer for more efficient scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe all destination sections
    destinationSections.forEach(section => {
        observer.observe(section);
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    }

    // Throttled parallax handler
    let parallaxTicking = false;
    function requestParallaxTick() {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    }

    window.addEventListener('scroll', function() {
        requestParallaxTick();
        parallaxTicking = false;
    });

    // Enhanced image placeholder interactions
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    imagePlaceholders.forEach(placeholder => {
        placeholder.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        placeholder.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        // Add click interaction for future image lightbox functionality
        placeholder.addEventListener('click', function() {
            const imageName = this.querySelector('span').textContent;
            console.log('Image clicked:', imageName);
            // Placeholder for future lightbox or modal functionality
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Navigate with arrow keys
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const currentSection = getCurrentSection();
            const sections = Array.from(destinationSections);
            const currentIndex = sections.indexOf(currentSection);
            
            let targetIndex;
            if (e.key === 'ArrowDown') {
                targetIndex = Math.min(currentIndex + 1, sections.length - 1);
            } else {
                targetIndex = Math.max(currentIndex - 1, 0);
            }
            
            const targetSection = sections[targetIndex];
            scrollToSection(targetSection);
        }
        
        // Home key - scroll to top
        if (e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // End key - scroll to bottom
        if (e.key === 'End') {
            e.preventDefault();
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    });

    // Helper function to get current section in viewport
    function getCurrentSection() {
        const scrollTop = window.pageYOffset;
        const navHeight = navbar ? navbar.offsetHeight : 0;
        let current = destinationSections[0];
        destinationSections.forEach(section => {
            const headerTop = getSectionHeaderTop(section) - navHeight - 20;
            if (scrollTop >= headerTop) {
                current = section;
            }
        });
        return current;
    }

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate in the hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                heroContent.style.transition = 'all 1s ease';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 500);
        }
    });

    // Add CSS animations for enhanced interactions
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
        
        body.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Console welcome message for developers
    console.log(`
🌍 Welcome to the Travel Blog!
    
✈️ Features included:
- Smooth scrolling navigation
- Mobile-responsive design
- Scroll progress indicator
- Active navigation highlighting
- Keyboard navigation support
- Intersection Observer animations
- Parallax hero effect

🔧 Ready for customization!
    `);
});