/**
 * BookMyCinema - Main Application JavaScript
 * Handles home page functionality including:
 * - Hero slider
 * - Movie grid rendering
 * - Search and filter functionality
 * - Navigation interactions
 */

// ============================================
// DOM Elements
// ============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const heroSlider = document.getElementById('heroSlider');
const heroIndicators = document.getElementById('heroIndicators');
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const genreFilter = document.getElementById('genreFilter');
const chips = document.querySelectorAll('.chip');

// ============================================
// State Variables
// ============================================
let currentSlide = 0;
let slideInterval;
const featuredMovies = MovieData.movies.slice(0, 5);

// ============================================
// Navigation Functionality
// ============================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ============================================
// Hero Slider Functionality
// ============================================

/**
 * Initialize the hero slider with featured movies
 */
function initHeroSlider() {
    // Generate slides
    heroSlider.innerHTML = featuredMovies.map((movie, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="hero-bg" style="background-image: url('${movie.banner}')"></div>
            <div class="hero-gradient"></div>
            <div class="hero-content">
                <div class="container">
                    <span class="hero-tag">Now Showing</span>
                    <h1 class="hero-title">${movie.title}</h1>
                    <div class="hero-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${movie.rating}/10
                        </span>
                        <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                        <span><i class="fas fa-film"></i> ${movie.genre.split(',')[0]}</span>
                        <span><i class="fas fa-globe"></i> ${movie.language}</span>
                    </div>
                    <p class="hero-description">${movie.description.substring(0, 200)}...</p>
                    <div class="hero-buttons">
                        <a href="movie-details.html?id=${movie.id}" class="btn btn-primary">
                            <i class="fas fa-ticket-alt"></i> Book Now
                        </a>
                        <a href="${movie.trailerUrl}" target="_blank" class="btn btn-secondary">
                            <i class="fas fa-play"></i> Watch Trailer
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Generate indicators
    heroIndicators.innerHTML = featuredMovies.map((_, index) => `
        <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
    
    // Add click handlers to indicators
    heroIndicators.querySelectorAll('.indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            goToSlide(parseInt(indicator.dataset.index));
        });
    });
    
    // Start auto-slide
    startSlideInterval();
}

/**
 * Navigate to a specific slide
 */
function goToSlide(index) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const indicators = heroIndicators.querySelectorAll('.indicator');
    
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
    
    // Reset interval
    clearInterval(slideInterval);
    startSlideInterval();
}

/**
 * Start automatic slide interval
 */
function startSlideInterval() {
    slideInterval = setInterval(() => {
        const nextSlide = (currentSlide + 1) % featuredMovies.length;
        goToSlide(nextSlide);
    }, 5000);
}

// ============================================
// Movie Grid Functionality
// ============================================

/**
 * Render movie cards in the grid
 */
function renderMovies(movies) {
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="goToMovieDetails(${movie.id})">
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'">
                <div class="movie-rating">
                    <i class="fas fa-star"></i> ${movie.rating}
                </div>
                <div class="movie-overlay">
                    <button class="btn btn-primary btn-book" onclick="event.stopPropagation(); goToMovieDetails(${movie.id})">
                        <i class="fas fa-ticket-alt"></i> Book Now
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.genre}</p>
                <div class="movie-meta-small">
                    <span><i class="fas fa-clock"></i> ${movie.duration}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Navigate to movie details page
 */
function goToMovieDetails(movieId) {
    window.location.href = `movie-details.html?id=${movieId}`;
}

// ============================================
// Search and Filter Functionality
// ============================================

/**
 * Handle search input
 */
searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
        const results = MovieData.searchMovies(query);
        renderMovies(results);
    } else {
        renderMovies(MovieData.movies);
    }
}, 300));

/**
 * Handle language filter change
 */
languageFilter.addEventListener('change', applyFilters);

/**
 * Handle genre filter change
 */
genreFilter.addEventListener('change', applyFilters);

/**
 * Handle genre chip clicks
 */
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        // Remove active class from all chips
        chips.forEach(c => c.classList.remove('active'));
        // Add active class to clicked chip
        chip.classList.add('active');
        // Update genre filter select
        genreFilter.value = chip.dataset.genre;
        // Apply filters
        applyFilters();
    });
});

/**
 * Apply all active filters
 */
function applyFilters() {
    const language = languageFilter.value;
    const genre = genreFilter.value;
    
    const filteredMovies = MovieData.filterMovies(language, genre);
    renderMovies(filteredMovies);
    
    // Update active chip
    chips.forEach(chip => {
        if (chip.dataset.genre === genre) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

// ============================================
// Theater List (Home Page Preview)
// ============================================

/**
 * Render theater preview on home page
 */
function renderTheaters() {
    const theaterList = document.getElementById('theaterList');
    if (!theaterList) return;
    
    theaterList.innerHTML = MovieData.theaters.map(theater => `
        <div class="theater-card">
            <div class="theater-header">
                <div>
                    <h3 class="theater-name">${theater.name}</h3>
                    <p class="theater-location">
                        <i class="fas fa-map-marker-alt"></i> ${theater.location} • ${theater.distance}
                    </p>
                </div>
                <div class="theater-facilities">
                    ${theater.facilities.slice(0, 3).map(f => `
                        <span class="facility-tag">${f}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// Coming Soon Section
// ============================================

/**
 * Render coming soon movies
 */
function renderComingSoon() {
    const comingSoonGrid = document.getElementById('comingSoonGrid');
    if (!comingSoonGrid) return;
    
    // Use last 4 movies as "coming soon" for demo
    const comingSoonMovies = MovieData.movies.slice(-4);
    
    comingSoonGrid.innerHTML = comingSoonMovies.map(movie => `
        <div class="movie-card">
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'">
                <div class="movie-rating">
                    <i class="fas fa-star"></i> ${movie.rating}
                </div>
                <div class="movie-overlay">
                    <button class="btn btn-secondary" style="flex: 1;">
                        <i class="fas fa-bell"></i> Notify Me
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.genre}</p>
            </div>
        </div>
    `).join('');
}

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function for search input
 */
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

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    renderMovies(MovieData.movies);
    renderTheaters();
    renderComingSoon();
    
    console.log('🎬 BookMyCinema App Initialized');
});
