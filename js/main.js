// Portfolio Clément LAFAIRE
console.log('Portfolio chargé');

// Configuration du fond dynamique avec grille
const GRID_SIZE = 20; // Espacement entre les points (réduit de 40 à 20)
const INTERACTION_RADIUS = 100; // Rayon d'interaction au survol

class DynamicGrid {
    constructor() {
        console.log('Initialisation DynamicGrid');
        this.container = document.getElementById('grid-background');
        if (!this.container) {
            console.error('grid-background non trouvé');
            return;
        }
        this.dots = [];
        this.mouse = { x: 0, y: 0 };
        this.createGrid();
        this.setupEventListeners();
        console.log('Grille créée avec', this.dots.length, 'points');
    }

    createGrid() {
        // Créer le SVG pour les lignes pointillées
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'grid-lines');
        
        const cols = Math.ceil(window.innerWidth / GRID_SIZE) + 1;
        const rows = Math.ceil(window.innerHeight / GRID_SIZE) + 1;

        // Lignes verticales
        for (let i = 0; i < cols; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', i * GRID_SIZE);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', i * GRID_SIZE);
            line.setAttribute('y2', window.innerHeight);
            svg.appendChild(line);
        }

        // Lignes horizontales
        for (let i = 0; i < rows; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', i * GRID_SIZE);
            line.setAttribute('x2', window.innerWidth);
            line.setAttribute('y2', i * GRID_SIZE);
            svg.appendChild(line);
        }

        this.container.appendChild(svg);

        // Créer les points
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const dot = document.createElement('div');
                dot.className = 'grid-dot';
                dot.style.left = (i * GRID_SIZE - 1.5) + 'px';
                dot.style.top = (j * GRID_SIZE - 1.5) + 'px';
                dot.dataset.x = i * GRID_SIZE;
                dot.dataset.y = j * GRID_SIZE;
                this.container.appendChild(dot);
                this.dots.push(dot);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.updateDots();
    }

    updateDots() {
        this.dots.forEach(dot => {
            const dotX = parseInt(dot.dataset.x);
            const dotY = parseInt(dot.dataset.y);
            
            const distance = Math.sqrt(
                Math.pow(this.mouse.x - dotX, 2) + 
                Math.pow(this.mouse.y - dotY, 2)
            );

            if (distance < INTERACTION_RADIUS) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    handleResize() {
        // Optionnel : régénérer la grille si nécessaire
    }
}

class ParallaxSlider {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.slider = wrapper.querySelector('[data-slider]');
        this.sliderItems = [...wrapper.querySelectorAll('.projects-slider-item')];
        this.parallaxElements = [...wrapper.querySelectorAll('[data-p]')];
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.velocity = 0;
        this.lastX = 0;
        
        if (!this.slider || this.sliderItems.length === 0) return;
        
        // Calculate item width and total scroll
        this.itemWidth = this.sliderItems[0].offsetWidth || 0;
        this.totalItems = this.sliderItems.length;
        
        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        // Mouse events
        this.slider.addEventListener('mousedown', (e) => this.handleStart(e));
        this.slider.addEventListener('mousemove', (e) => this.handleMove(e));
        this.slider.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.slider.addEventListener('mouseleave', (e) => this.handleEnd(e));
        
        // Touch events
        this.slider.addEventListener('touchstart', (e) => this.handleStart(e));
        this.slider.addEventListener('touchmove', (e) => this.handleMove(e));
        this.slider.addEventListener('touchend', (e) => this.handleEnd(e));

        // Wheel event for scroll
        // Note: pas de passive: false ici car on veut potentiellement bloquer le scroll
        this.slider.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    }

    handleStart(e) {
        this.isDragging = true;
        this.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        this.scrollLeft = this.slider.scrollLeft;
        this.lastX = this.startX;
        this.velocity = 0;
    }

    handleMove(e) {
        if (!this.isDragging) return;
        
        // Sur mobile, on veut empêcher le scroll vertical SI on est en train de slider horizontalement
        // Mais pas si on essaie de descendre. C'est un peu tricky, mais e.preventDefault() ici est souvent nécessaire pour le drag
        e.preventDefault();
        
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const walk = (x - this.startX) * 1.5; // J'ai réduit la sensibilité (de 5 à 1.5) car 5 c'est très violent
        
        this.velocity = x - this.lastX;
        this.lastX = x;
        
        this.slider.scrollLeft = this.scrollLeft - walk;
        // J'AI SUPPRIMÉ L'APPEL À handleInfiniteScroll ICI
        this.updateParallax();
    }

    handleEnd(e) {
        this.isDragging = false;
        this.applyInertia();
    }

    handleWheel(e) {
        const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;
        const isAtEnd = this.slider.scrollLeft >= maxScroll - 2; // Petite tolérance de 2px
        const isAtStart = this.slider.scrollLeft <= 2;
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        // LOGIQUE CRITIQUE POUR PERMETTRE DE DESCENDRE LA PAGE :
        // Si on est à la fin et qu'on scroll vers le bas (droite) -> On laisse faire (return)
        if (isAtEnd && scrollingDown) return;

        // Si on est au début et qu'on scroll vers le haut (gauche) -> On laisse faire (return)
        if (isAtStart && scrollingUp) return;

        // Sinon, on est au milieu du slider : on bloque la page et on bouge le slider
        e.preventDefault();
        const scrollAmount = e.deltaY * 2; // Vitesse du scroll molette
        this.slider.scrollLeft += scrollAmount;
        
        // J'AI SUPPRIMÉ L'APPEL À handleInfiniteScroll ICI
        this.updateParallax();
    }

    applyInertia() {
        if (Math.abs(this.velocity) > 0.5) {
            this.velocity *= 0.95;
            this.slider.scrollLeft -= this.velocity * 2; // Inversion du signe pour suivre le mouvement naturel
            
            // J'AI SUPPRIMÉ L'APPEL À handleInfiniteScroll ICI
            
            // On vérifie les bornes pour arrêter l'inertie si on tape un mur
            const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;
            if (this.slider.scrollLeft <= 0 || this.slider.scrollLeft >= maxScroll) {
                this.velocity = 0;
            }

            this.updateParallax();
            requestAnimationFrame(() => this.applyInertia());
        }
    }

    // J'AI COMPLÈTEMENT SUPPRIMÉ LA FONCTION handleInfiniteScroll()

    updateParallax() {
        const scrollLeft = this.slider.scrollLeft;
        const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;
        
        // Normalize scroll position (0 to 1)
        const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        
        this.parallaxElements.forEach((element, index) => {
            // Create staggered parallax effect
            const parallaxOffset = scrollPercent * (index + 1) * 50;
            element.style.transform = `translateX(${parallaxOffset}px)`;
        });
    }

    animate() {
        this.updateParallax();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialiser immédiatement si possible, sinon attendre le DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DynamicGrid();
        const projetsSection = document.getElementById('projets');
        if (projetsSection) {
            new ParallaxSlider(projetsSection);
        }
    });
} else {
    new DynamicGrid();
    const projetsSection = document.getElementById('projets');
    if (projetsSection) {
        new ParallaxSlider(projetsSection);
    }
}

// Hamburger Menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a');

    // Toggle menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && !e.target.closest('.hamburger-menu')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});
