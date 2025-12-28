/**
 * BookMyCinema - Payment Page JavaScript
 * Handles payment functionality including:
 * - Order summary display
 * - Payment method selection
 * - Form validation
 * - Mock payment processing
 * - Confirmation modal
 */

// ============================================
// DOM Elements
// ============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const countdown = document.getElementById('countdown');
const orderMovie = document.getElementById('orderMovie');
const orderTheater = document.getElementById('orderTheater');
const orderDateTime = document.getElementById('orderDateTime');
const orderSeats = document.getElementById('orderSeats');
const orderTicketPrice = document.getElementById('orderTicketPrice');
const orderFee = document.getElementById('orderFee');
const orderTotal = document.getElementById('orderTotal');
const payAmount1 = document.getElementById('payAmount1');
const payAmount2 = document.getElementById('payAmount2');
const payAmount3 = document.getElementById('payAmount3');
const confirmationModal = document.getElementById('confirmationModal');
const bookingIdDisplay = document.getElementById('bookingIdDisplay');

// ============================================
// State Variables
// ============================================
let bookingInfo = null;
let currentMovie = null;
let currentTheater = null;
let selectedPaymentMethod = 'card';
let selectedUPI = null;
let selectedWallet = null;
let timerInterval = null;
let timeLeft = 600; // 10 minutes in seconds

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
        window.location.href = 'index.html';
        return false;
    }
    
    bookingInfo = JSON.parse(storedInfo);
    currentMovie = MovieData.getMovieById(bookingInfo.movieId);
    currentTheater = MovieData.getTheaterById(bookingInfo.theaterId);
    
    if (!currentMovie || !currentTheater || !bookingInfo.seats) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ============================================
// Order Summary Rendering
// ============================================

/**
 * Render order summary
 */
function renderOrderSummary() {
    // Movie info
    orderMovie.innerHTML = `
        <div class="order-poster">
            <img src="${currentMovie.poster}" alt="${currentMovie.title}"
                 onerror="this.src='https://via.placeholder.com/80x120/1a1a1a/666?text=No+Image'">
        </div>
        <div class="order-details">
            <h3>${currentMovie.title}</h3>
            <p>${currentMovie.certificate} • ${currentMovie.language}</p>
            <p>${currentMovie.duration}</p>
        </div>
    `;
    
    // Theater, date, time
    orderTheater.textContent = currentTheater.name;
    orderDateTime.textContent = `${bookingInfo.date.day}, ${bookingInfo.date.date} ${bookingInfo.date.month} | ${bookingInfo.time}`;
    
    // Seats
    orderSeats.innerHTML = bookingInfo.seats
        .map(seat => `<span class="order-seat-tag">${seat}</span>`)
        .join('');
    
    // Prices
    orderTicketPrice.textContent = bookingInfo.ticketPrice;
    orderFee.textContent = bookingInfo.convenienceFee;
    orderTotal.textContent = bookingInfo.totalAmount;
    
    // Update pay button amounts
    payAmount1.textContent = bookingInfo.totalAmount;
    payAmount2.textContent = bookingInfo.totalAmount;
    payAmount3.textContent = bookingInfo.totalAmount;
    
    // Update page title
    document.title = `Payment - ${currentMovie.title} - BookMyCinema`;
}

// ============================================
// Countdown Timer
// ============================================

/**
 * Start countdown timer
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdown.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 60) {
            countdown.style.color = '#ff4444';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showTimeoutModal();
        }
    }, 1000);
}

/**
 * Show timeout modal
 */
function showTimeoutModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-icon error">
                <i class="fas fa-clock"></i>
            </div>
            <h2>Session Expired</h2>
            <p>Your booking session has expired. Please start again.</p>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.location.href='index.html'">
                    <i class="fas fa-home"></i> Go Home
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ============================================
// Payment Tab Switching
// ============================================

/**
 * Switch payment method tab
 */
function switchPaymentTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.payment-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update form visibility
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Form`).classList.add('active');
    
    selectedPaymentMethod = tab;
}

// ============================================
// UPI Selection
// ============================================

/**
 * Select UPI provider
 */
function selectUPI(element, provider) {
    document.querySelectorAll('.upi-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedUPI = provider;
}

// ============================================
// Wallet Selection
// ============================================

/**
 * Select wallet provider
 */
function selectWallet(element, provider) {
    document.querySelectorAll('.wallet-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedWallet = provider;
}

// ============================================
// Form Validation
// ============================================

/**
 * Validate card form
 */
function validateCardForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value.trim();
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    let isValid = true;
    
    // Card number validation (16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
        showFieldError('cardNumber', 'Please enter a valid 16-digit card number');
        isValid = false;
    }
    
    // Name validation
    if (cardName.length < 3) {
        showFieldError('cardName', 'Please enter the cardholder name');
        isValid = false;
    }
    
    // Expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        showFieldError('expiryDate', 'Please enter a valid date (MM/YY)');
        isValid = false;
    }
    
    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cvv)) {
        showFieldError('cvv', 'Please enter a valid CVV');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    
    // Remove error on input
    field.addEventListener('input', () => {
        field.classList.remove('error');
        const error = field.parentElement.querySelector('.error-message');
        if (error) error.remove();
    }, { once: true });
}

// ============================================
// Card Number Formatting
// ============================================

document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    
    e.target.value = formatted;
});

document.getElementById('expiryDate').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    e.target.value = value;
});

// ============================================
// Payment Processing
// ============================================

/**
 * Process payment (mock)
 */
function processPayment() {
    let isValid = true;
    
    if (selectedPaymentMethod === 'card') {
        isValid = validateCardForm();
    } else if (selectedPaymentMethod === 'upi' && !selectedUPI) {
        const upiId = document.getElementById('upiId').value.trim();
        if (!upiId && !selectedUPI) {
            showFieldError('upiId', 'Please select a UPI provider or enter UPI ID');
            isValid = false;
        }
    } else if (selectedPaymentMethod === 'wallet' && !selectedWallet) {
        showToast('Please select a wallet');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const payBtn = document.querySelector('.btn-pay');
    const originalText = payBtn.innerHTML;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Stop timer
        clearInterval(timerInterval);
        
        // Generate booking ID
        const bookingId = generateBookingId();
        bookingIdDisplay.textContent = bookingId;
        
        // Show confirmation modal
        confirmationModal.classList.add('active');
        
        // Clear session storage
        sessionStorage.removeItem('bookingInfo');
        
    }, 2000);
}

/**
 * Generate random booking ID
 */
function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'CBK-';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// ============================================
// Modal Actions
// ============================================

/**
 * Download ticket (mock)
 */
function downloadTicket() {
    showToast('Ticket downloaded successfully!');
}

/**
 * Go to home page
 */
function goToHome() {
    window.location.href = 'index.html';
}

// ============================================
// Toast Notification
// ============================================

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
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
        renderOrderSummary();
        startTimer();
        
        console.log('🎬 Payment Page Initialized');
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
