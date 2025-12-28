/**
 * BookMyCinema - Movie Details Page JavaScript
 * Handles movie details page functionality including:
 * - Loading movie information
 * - Date selection
 * - Theater and showtime display
 */

// ============================================
// DOM Elements
// ============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const bannerBg = document.getElementById('bannerBg');
const moviePoster = document.getElementById('moviePoster');
const movieInfo = document.getElementById('movieInfo');
const dateSelector = document.getElementById('dateSelector');
const theaterShowtimes = document.getElementById('theaterShowtimes');

// ============================================
// State Variables
// ============================================
let currentMovie = null;
let selectedDate = null;

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

// ============================================
// URL Parameter Handling
// ============================================

/**
 * Get movie ID from URL parameters
 */
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ============================================
// Movie Details Rendering
// ============================================

/**
 * Load and render movie details
 */
function loadMovieDetails() {
    const movieId = getMovieIdFromUrl();
    
    if (!movieId) {
        // Default to first movie if no ID provided
        currentMovie = MovieData.movies[0];
    } else {
        currentMovie = MovieData.getMovieById(movieId);
    }
    
    if (!currentMovie) {
        showError('Movie not found');
        return;
    }
    
    // Update page title
    document.title = `${currentMovie.title} - BookMyCinema`;
    
    // Render banner background
    bannerBg.style.backgroundImage = `url('${currentMovie.banner}')`;
    
    // Render poster
    moviePoster.innerHTML = `
        <img src="${currentMovie.poster}" alt="${currentMovie.title}"
             onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'">
    `;
    
    // Render movie info
    movieInfo.innerHTML = `
        <h1 class="movie-title">${currentMovie.title}</h1>
        
        <div class="rating-large">
            <i class="fas fa-star"></i>
            <span class="score">${currentMovie.rating}</span>
            <span class="max">/10</span>
        </div>
        
        <div class="movie-meta-row">
            <span><i class="fas fa-clock"></i> ${currentMovie.duration}</span>
            <span><i class="fas fa-film"></i> ${currentMovie.genre}</span>
            <span><i class="fas fa-globe"></i> ${currentMovie.language}</span>
            <span><i class="fas fa-certificate"></i> ${currentMovie.certificate}</span>
        </div>
        
        <p class="movie-description">${currentMovie.description}</p>
        
        <div class="cast-section">
            <h3 style="margin-bottom: var(--spacing-md); color: var(--text-secondary);">Cast</h3>
            <div class="cast-list">
                ${currentMovie.cast.map(actor => `
                    <div class="cast-item">
                        <div class="cast-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <p class="cast-name">${actor}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="movie-actions-large">
            <a href="${currentMovie.trailerUrl}" target="_blank" class="btn btn-secondary">
                <i class="fas fa-play"></i> Watch Trailer
            </a>
            <button class="btn btn-primary" onclick="scrollToShowtimes()">
                <i class="fas fa-ticket-alt"></i> Book Tickets
            </button>
        </div>
    `;
}

/**
 * Scroll to showtimes section
 */
function scrollToShowtimes() {
    document.getElementById('theaters-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// ============================================
// Date Selection
// ============================================

/**
 * Render date selector
 */
function renderDateSelector() {
    const dates = MovieData.dates;
    selectedDate = dates[0];
    
    dateSelector.innerHTML = dates.map((date, index) => `
        <div class="date-item ${index === 0 ? 'active' : ''}" 
             data-date="${date.fullDate}"
             onclick="selectDate(this, '${date.fullDate}')">
            <span class="day">${date.day}</span>
            <span class="date">${date.date}</span>
            <span class="month">${date.month}</span>
        </div>
    `).join('');
}

/**
 * Handle date selection
 */
function selectDate(element, fullDate) {
    // Remove active class from all date items
    dateSelector.querySelectorAll('.date-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected date
    element.classList.add('active');
    
    // Update selected date
    selectedDate = MovieData.dates.find(d => d.fullDate === fullDate);
    
    // Re-render theaters with new date
    renderTheaterShowtimes();
}

// ============================================
// Theater & Showtimes Rendering
// ============================================

/**
 * Render theaters with showtimes
 */
function renderTheaterShowtimes() {
    theaterShowtimes.innerHTML = MovieData.theaters.map(theater => {
        const showtimes = MovieData.getShowtimes(theater.id);
        
        return `
            <div class="theater-card">
                <div class="theater-header">
                    <div>
                        <h3 class="theater-name">${theater.name}</h3>
                        <p class="theater-location">
                            <i class="fas fa-map-marker-alt"></i> ${theater.location} • ${theater.distance}
                        </p>
                    </div>
                    <div class="theater-facilities">
                        ${theater.facilities.map(f => `
                            <span class="facility-tag">${f}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="showtimes">
                    ${showtimes.map(show => `
                        <button class="showtime-btn ${show.status}" 
                                onclick="selectShowtime(${currentMovie.id}, ${theater.id}, '${show.time}', ${show.price})">
                            ${show.time}
                            <small style="display: block; font-size: 0.7rem; opacity: 0.8;">₹${show.price}</small>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Handle showtime selection and navigate to seat selection
 */
function selectShowtime(movieId, theaterId, time, price) {
    // Store booking info in session storage
    const bookingInfo = {
        movieId: movieId,
        theaterId: theaterId,
        date: selectedDate,
        time: time,
        basePrice: price
    };
    
    sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    
    // Navigate to seat selection page
    window.location.href = `seat-selection.html?movie=${movieId}&theater=${theaterId}`;
}

// ============================================
// Error Handling
// ============================================

/**
 * Show error message
 */
function showError(message) {
    movieInfo.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xxl);">
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: var(--spacing-md);"></i>
            <h2>${message}</h2>
            <p style="color: var(--text-muted); margin-bottom: var(--spacing-lg);">
                The movie you're looking for could not be found.
            </p>
            <a href="index.html" class="btn btn-primary">
                <i class="fas fa-home"></i> Go Back Home
            </a>
        </div>
    `;
}

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadMovieDetails();
    renderDateSelector();
    renderTheaterShowtimes();
    
    console.log('🎬 Movie Details Page Initialized');
});
