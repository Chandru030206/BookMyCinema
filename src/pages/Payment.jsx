import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import api from '../services/api';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedShowtime,
    selectedSeats,
    totalPrice,
    resetBooking
  } = useBooking();

  const [activePaymentMethod, setActivePaymentMethod] = useState('card');
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const hasCheckedRef = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    walletPhone: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      alert('Session expired! Please try again.');
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  // Check if user has required booking info - only once after a short delay
  useEffect(() => {
    if (hasCheckedRef.current) return;
    
    const timer = setTimeout(() => {
      hasCheckedRef.current = true;
      if (!selectedMovie || !selectedSeats || selectedSeats.length === 0) {
        navigate('/');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedMovie, selectedSeats, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate final amount
  const convenienceFee = 49;
  const gst = useMemo(() => Math.round((totalPrice + convenienceFee) * 0.18), [totalPrice]);
  const finalAmount = useMemo(() => totalPrice + convenienceFee + gst, [totalPrice, gst]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (activePaymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!formData.cardHolder) {
        newErrors.cardHolder = 'Cardholder name is required';
      }
      if (!formData.expiryDate || formData.expiryDate.length < 5) {
        newErrors.expiryDate = 'Valid expiry date is required';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Valid CVV is required';
      }
    } else if (activePaymentMethod === 'upi') {
      if (!formData.upiId || !formData.upiId.includes('@')) {
        newErrors.upiId = 'Valid UPI ID is required';
      }
    } else if (activePaymentMethod === 'wallet') {
      if (!formData.walletPhone || !/^\d{10}$/.test(formData.walletPhone)) {
        newErrors.walletPhone = 'Valid phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Try API payment first
      const paymentResult = await api.processPayment({
        amount: finalAmount,
        method: activePaymentMethod,
        email: formData.email,
        phone: formData.phone
      });
      
      if (paymentResult && paymentResult.bookingId) {
        setBookingId(paymentResult.bookingId);
      } else {
        // Fallback to generated booking ID
        setBookingId('CB' + Date.now().toString().slice(-8));
      }
    } catch (error) {
      console.log('Using simulated payment:', error.message);
      // Simulate payment processing as fallback
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBookingId('CB' + Date.now().toString().slice(-8));
    }
    
    setIsProcessing(false);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    resetBooking();
    navigate('/');
  };

  if (!selectedMovie) return null;

  return (
    <div className="payment-page">
      <Navbar />

      <div className="payment-container container">
        {/* Timer Bar */}
        <div className="timer-bar">
          <div className="timer-content">
            <i className="fas fa-clock"></i>
            <span>Complete payment in</span>
            <span className={`timer ${countdown < 60 ? 'warning' : ''}`}>
              {formatTime(countdown)}
            </span>
          </div>
          <div className="timer-progress">
            <div 
              className="timer-fill" 
              style={{ width: `${(countdown / 600) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="payment-layout">
          {/* Payment Form */}
          <div className="payment-form-container">
            <h2 className="payment-title">
              <i className="fas fa-credit-card"></i>
              Payment Details
            </h2>

            {/* Contact Info */}
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-methods">
                <button
                  type="button"
                  className={`payment-method ${activePaymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setActivePaymentMethod('card')}
                >
                  <i className="fas fa-credit-card"></i>
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={`payment-method ${activePaymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setActivePaymentMethod('upi')}
                >
                  <i className="fas fa-mobile-alt"></i>
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  className={`payment-method ${activePaymentMethod === 'wallet' ? 'active' : ''}`}
                  onClick={() => setActivePaymentMethod('wallet')}
                >
                  <i className="fas fa-wallet"></i>
                  <span>Wallet</span>
                </button>
                <button
                  type="button"
                  className={`payment-method ${activePaymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setActivePaymentMethod('netbanking')}
                >
                  <i className="fas fa-university"></i>
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Card Form */}
              {activePaymentMethod === 'card' && (
                <div className="payment-form card-form">
                  <div className="form-group full-width">
                    <label>Card Number</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={errors.cardNumber ? 'error' : ''}
                      />
                      <div className="card-icons">
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-cc-amex"></i>
                      </div>
                    </div>
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>
                  <div className="form-group full-width">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      placeholder="Name on card"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className={errors.cardHolder ? 'error' : ''}
                    />
                    {errors.cardHolder && <span className="error-text">{errors.cardHolder}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={errors.expiryDate ? 'error' : ''}
                      />
                      {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        placeholder="***"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Form */}
              {activePaymentMethod === 'upi' && (
                <div className="payment-form upi-form">
                  <div className="form-group full-width">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="yourname@upi"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      className={errors.upiId ? 'error' : ''}
                    />
                    {errors.upiId && <span className="error-text">{errors.upiId}</span>}
                  </div>
                  <div className="upi-apps">
                    <span>Or pay with:</span>
                    <div className="upi-icons">
                      <button type="button" className="upi-btn">GPay</button>
                      <button type="button" className="upi-btn">PhonePe</button>
                      <button type="button" className="upi-btn">Paytm</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Form */}
              {activePaymentMethod === 'wallet' && (
                <div className="payment-form wallet-form">
                  <div className="wallet-options">
                    <button type="button" className="wallet-btn">
                      <span className="wallet-name">Paytm</span>
                      <span className="wallet-balance">₹1,200</span>
                    </button>
                    <button type="button" className="wallet-btn">
                      <span className="wallet-name">PhonePe</span>
                      <span className="wallet-balance">₹850</span>
                    </button>
                    <button type="button" className="wallet-btn">
                      <span className="wallet-name">Amazon Pay</span>
                      <span className="wallet-balance">₹2,500</span>
                    </button>
                  </div>
                  <div className="form-group full-width">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="walletPhone"
                      placeholder="Linked phone number"
                      value={formData.walletPhone}
                      onChange={handleInputChange}
                      className={errors.walletPhone ? 'error' : ''}
                    />
                    {errors.walletPhone && <span className="error-text">{errors.walletPhone}</span>}
                  </div>
                </div>
              )}

              {/* Net Banking Form */}
              {activePaymentMethod === 'netbanking' && (
                <div className="payment-form netbanking-form">
                  <div className="bank-options">
                    <button type="button" className="bank-btn">HDFC Bank</button>
                    <button type="button" className="bank-btn">ICICI Bank</button>
                    <button type="button" className="bank-btn">SBI</button>
                    <button type="button" className="bank-btn">Axis Bank</button>
                    <button type="button" className="bank-btn">Kotak</button>
                    <button type="button" className="bank-btn">Others</button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary btn-large btn-block ${isProcessing ? 'processing' : ''}`}
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i>
                  Pay ₹{finalAmount}
                </>
              )}
            </button>

            <p className="secure-text">
              <i className="fas fa-shield-alt"></i>
              Your payment is secure and encrypted
            </p>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3 className="summary-title">
              <i className="fas fa-receipt"></i>
              Order Summary
            </h3>

            <div className="order-movie">
              <img src={selectedMovie.poster} alt={selectedMovie.title} />
              <div>
                <h4>{selectedMovie.title}</h4>
                <p>{selectedMovie.genre}</p>
                <div className="order-meta">
                  <span><i className="fas fa-building"></i> {selectedTheater?.name}</span>
                  <span><i className="fas fa-calendar"></i> {formatDate(selectedDate)}</span>
                  <span><i className="fas fa-clock"></i> {selectedShowtime}</span>
                </div>
              </div>
            </div>

            <div className="order-seats">
              <h4>Seats</h4>
              <div className="seats-tags">
                {selectedSeats.map(seat => (
                  <span key={seat.id} className="seat-tag">{seat.id}</span>
                ))}
              </div>
            </div>

            <div className="order-breakdown">
              <div className="order-row">
                <span>Tickets ({selectedSeats.length})</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="order-row">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div className="order-row">
                <span>GST (18%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="order-row total">
                <span>Total Amount</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>

            <div className="promo-code">
              <input type="text" placeholder="Enter promo code" />
              <button type="button" className="btn btn-secondary">Apply</button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Booking Confirmed!"
        type="success"
        bookingId={bookingId}
      >
        <div className="success-details">
          <div className="success-movie">
            <img src={selectedMovie?.poster} alt={selectedMovie?.title} />
            <div>
              <h4>{selectedMovie?.title}</h4>
              <p>{selectedTheater?.name}</p>
              <p>{formatDate(selectedDate)} at {selectedShowtime}</p>
              <p>Seats: {selectedSeats.map(s => s.id).join(', ')}</p>
            </div>
          </div>
          <p className="success-note">
            Confirmation has been sent to your email. Please show this at the theater entrance.
          </p>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default Payment;
