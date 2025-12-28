/**
 * BookMyCinema - Seat Selection Page JavaScript
 * Handles seat selection functionality including:
 * - Dynamic seat layout generation
 * - Seat selection/deselection
 * - Price calculation
 * - Booking summary updates
 */

// ============================================
// DOM Elements
// ============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const seatsContainer = document.getElementById('seatsContainer');
const headerMovieInfo = document.getElementById('headerMovieInfo');
const summaryHeader = document.getElementById('summaryHeader');
const summaryDetails = document.getElementById('summaryDetails');
const selectedSeatsList = document.getElementById('selectedSeatsList');
const ticketCount = document.getElementById('ticketCount');
const ticketPrice = document.getElementById('ticketPrice');
const convenienceFee = document.getElementById('convenienceFee');
const totalPrice = document.getElementById('totalPrice');
const proceedBtn = document.getElementById('proceedBtn');
const mobileSeatsCount = document.getElementById('mobileSeatsCount');
const mobileTotalPrice = document.getElementById('mobileTotalPrice');

// ============================================
// State Variables
// ============================================
let bookingInfo = null;
let currentMovie = null;
let currentTheater = null;
let selectedSeats = [];
const CONVENIENCE_FEE_PER_TICKET = 30;

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
// Load Booking Information
// ============================================

/**
 * Load booking info from session storage
 */
function loadBookingInfo() {
    const storedInfo = sessionStorage.getItem('bookingInfo');
    
    if (!storedInfo) {
        // If no booking info, redirect to home
        window.location.href = 'index.html';
        return false;
    }
    
    bookingInfo = JSON.parse(storedInfo);
    currentMovie = MovieData.getMovieById(bookingInfo.movieId);
    currentTheater = MovieData.getTheaterById(bookingInfo.theaterId);
    
    if (!currentMovie || !currentTheater) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ============================================
// Page Header & Summary Rendering
// ============================================

/**
 * Render page header with movie info
 */
function renderHeader() {
    headerMovieInfo.innerHTML = `
        <h1>${currentMovie.title}</h1>
        <p>${currentTheater.name} | ${bookingInfo.date.day}, ${bookingInfo.date.date} ${bookingInfo.date.month} | ${bookingInfo.time}</p>
    `;
    
    // Update page title
    document.title = `Select Seats - ${currentMovie.title} - BookMyCinema`;
}

/**
 * Render booking summary sidebar
 */
function renderSummary() {
    summaryHeader.innerHTML = `
        <div class="summary-poster">
            <img src="${currentMovie.poster}" alt="${currentMovie.title}"
                 onerror="this.src='https://via.placeholder.com/80x120/1a1a1a/666?text=No+Image'">
        </div>
        <div class="summary-movie-info">
            <h3>${currentMovie.title}</h3>
            <p>${currentMovie.certificate} • ${currentMovie.language}</p>
            <p>${currentMovie.genre.split(',')[0]}</p>
        </div>
    `;
    
    summaryDetails.innerHTML = `
        <div class="summary-row">
            <span class="label">Theater</span>
            <span class="value">${currentTheater.name}</span>
        </div>
        <div class="summary-row">
            <span class="label">Date</span>
            <span class="value">${bookingInfo.date.day}, ${bookingInfo.date.date} ${bookingInfo.date.month}</span>
        </div>
        <div class="summary-row">
            <span class="label">Time</span>
            <span class="value">${bookingInfo.time}</span>
        </div>
    `;
}

// ============================================
// Seat Layout Generation
// ============================================

/**
 * Generate seat layout based on configuration
 */
function generateSeatLayout() {
    const config = MovieData.seatConfig;
    const bookedSeats = MovieData.bookedSeats;
    
    let html = '';
    
    // Generate each section
    Object.keys(config).forEach(sectionKey => {
        const section = config[sectionKey];
        
        html += `
            <div class="seat-section">
                <div class="seat-section-header">
                    <span class="seat-section-name">${section.name} - ₹${section.price}</span>
                    <span class="seat-section-price">${section.rows.length * section.seatsPerRow} seats</span>
                </div>
                <div class="seats-grid">
        `;
        
        // Generate rows
        section.rows.forEach(row => {
            html += `
                <div class="seat-row">
                    <span class="row-label">${row}</span>
                    <div class="seats">
            `;
            
            // Generate seats with center gap
            const halfSeats = Math.floor(section.seatsPerRow / 2);
            
            for (let i = 1; i <= section.seatsPerRow; i++) {
                const seatId = `${row}${i}`;
                const isBooked = bookedSeats.includes(seatId);
                const isPremium = sectionKey === 'premium';
                
                let seatClass = 'seat';
                if (isBooked) seatClass += ' booked';
                if (isPremium) seatClass += ' premium';
                
                html += `
                    <button class="${seatClass}" 
                            data-seat="${seatId}" 
                            data-price="${section.price}"
                            data-section="${sectionKey}"
                            ${isBooked ? 'disabled' : ''}
                            onclick="toggleSeat(this)">
                        ${i}
                    </button>
                `;
                
                // Add gap in the middle
                if (i === halfSeats) {
                    html += '<div class="seat-gap"></div>';
                }
            }
            
            html += `
                    </div>
                    <span class="row-label">${row}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    seatsContainer.innerHTML = html;
}

// ============================================
// Seat Selection Logic
// ============================================

/**
 * Toggle seat selection
 */
function toggleSeat(seatElement) {
    const seatId = seatElement.dataset.seat;
    const price = parseInt(seatElement.dataset.price);
    
    if (seatElement.classList.contains('booked')) {
        return; // Can't select booked seats
    }
    
    if (seatElement.classList.contains('selected')) {
        // Deselect seat
        seatElement.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    } else {
        // Check max seats limit (optional - can limit to 10 seats)
        if (selectedSeats.length >= 10) {
            showToast('Maximum 10 seats can be selected');
            return;
        }
        
        // Select seat
        seatElement.classList.add('selected');
        selectedSeats.push({
            id: seatId,
            price: price,
            section: seatElement.dataset.section
        });
    }
    
    updateBookingSummary();
}

/**
 * Update booking summary with selected seats
 */
function updateBookingSummary() {
    const count = selectedSeats.length;
    const baseTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const fee = count * CONVENIENCE_FEE_PER_TICKET;
    const total = baseTotal + fee;
    
    // Update selected seats display
    if (count > 0) {
        selectedSeatsList.innerHTML = selectedSeats
            .map(seat => `<span class="seat-tag">${seat.id}</span>`)
            .join('');
    } else {
        selectedSeatsList.innerHTML = '<span style="color: var(--text-muted);">No seats selected</span>';
    }
    
    // Update price breakdown
    ticketCount.textContent = count;
    ticketPrice.textContent = baseTotal;
    convenienceFee.textContent = fee;
    totalPrice.textContent = total;
    
    // Update mobile summary
    mobileSeatsCount.textContent = count;
    mobileTotalPrice.textContent = total;
    
    // Enable/disable proceed button
    proceedBtn.disabled = count === 0;
}

// ============================================
// Navigation to Payment
// ============================================

/**
 * Proceed to payment page
 */
function proceedToPayment() {
    if (selectedSeats.length === 0) {
        showToast('Please select at least one seat');
        return;
    }
    
    // Calculate totals
    const baseTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const fee = selectedSeats.length * CONVENIENCE_FEE_PER_TICKET;
    const total = baseTotal + fee;
    
    // Update booking info with seat selection
    const updatedBookingInfo = {
        ...bookingInfo,
        seats: selectedSeats.map(s => s.id),
        seatDetails: selectedSeats,
        ticketPrice: baseTotal,
        convenienceFee: fee,
        totalAmount: total
    };
    
    sessionStorage.setItem('bookingInfo', JSON.stringify(updatedBookingInfo));
    
    // Navigate to payment page
    window.location.href = 'payment.html';
}

// ============================================
// Toast Notification
// ============================================

/**
 * Show toast notification
 */
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Initialize Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (loadBookingInfo()) {
        renderHeader();
        renderSummary();
        generateSeatLayout();
        updateBookingSummary();
        
        console.log('🎬 Seat Selection Page Initialized');
    }
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
