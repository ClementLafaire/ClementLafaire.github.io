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

// Initialiser immédiatement si possible, sinon attendre le DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DynamicGrid();
    });
} else {
    new DynamicGrid();
}


