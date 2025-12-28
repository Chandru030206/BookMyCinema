import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './SeatSelection.css';

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showId = location.state?.showId;
  const {
    selectedMovie,
    selectedTheater,
    selectedDate,
    selectedShowtime,
    selectedSeats,
    setSelectedSeats,
    setTotalPrice
  } = useBooking();

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  // Seat prices
  const seatPrices = {
    premium: 450,
    vip: 350,
    regular: 200
  };

  // Generate seat layout or fetch from API
  useEffect(() => {
    const fetchSeats = async () => {
      if (showId) {
        try {
          const seatData = await api.getSeats(showId);
          if (seatData && seatData.length > 0) {
            // Group seats by row
            const rows = {};
            seatData.forEach(seat => {
              if (!rows[seat.row_letter]) {
                rows[seat.row_letter] = [];
              }
              rows[seat.row_letter].push({
                id: `${seat.row_letter}${seat.seat_number}`,
                seatId: seat.id, // Database seat ID for booking
                row: seat.row_letter,
                number: seat.seat_number,
                type: seat.seat_type,
                isBooked: seat.is_booked === 1,
                price: seat.price
              });
            });
            
            // Convert to array format
            const layout = Object.keys(rows)
              .sort()
              .map(row => ({
                row,
                seats: rows[row].sort((a, b) => a.number - b.number)
              }));
            
            setSeats(layout);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Using generated seat data:', error.message);
        }
      }
      
      // Fallback to generated seats
      generateSeats();
      setLoading(false);
    };
    
    const generateSeats = () => {
      const layout = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = 16;

      rows.forEach((row, rowIndex) => {
        const rowSeats = [];
        for (let i = 1; i <= seatsPerRow; i++) {
          let type = 'regular';
          if (rowIndex < 2) type = 'premium';
          else if (rowIndex < 5) type = 'vip';

          // Random booked seats (about 30%)
          const isBooked = Math.random() < 0.3;

          rowSeats.push({
            id: `${row}${i}`,
            row,
            number: i,
            type,
            isBooked,
            price: seatPrices[type]
          });
        }
        layout.push({ row, seats: rowSeats });
      });

      setSeats(layout);
    };

    fetchSeats();
  }, [showId]);

  // Check if user has required booking info - only once after a short delay
  useEffect(() => {
    if (hasCheckedRef.current) return;
    
    const timer = setTimeout(() => {
      hasCheckedRef.current = true;
      if (!selectedMovie || !selectedTheater || !selectedShowtime) {
        navigate('/');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedMovie, selectedTheater, selectedShowtime, navigate]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 10) {
          alert('Maximum 10 seats allowed per booking');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      setTotalPrice(totalPrice);
      navigate('/payment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!selectedMovie) return null;

  return (
    <div className="seat-selection-page">
      <Navbar />

      <div className="seat-selection-container container">
        {/* Booking Info */}
        <div className="booking-info-bar">
          <div className="booking-info-item">
            <img src={selectedMovie.poster} alt={selectedMovie.title} className="mini-poster" />
            <div>
              <h3>{selectedMovie.title}</h3>
              <p>{selectedMovie.genre}</p>
            </div>
          </div>
          <div className="booking-info-item">
            <i className="fas fa-building"></i>
            <div>
              <span className="label">Theater</span>
              <span className="value">{selectedTheater?.name}</span>
            </div>
          </div>
          <div className="booking-info-item">
            <i className="fas fa-calendar"></i>
            <div>
              <span className="label">Date</span>
              <span className="value">{formatDate(selectedDate)}</span>
            </div>
          </div>
          <div className="booking-info-item">
            <i className="fas fa-clock"></i>
            <div>
              <span className="label">Showtime</span>
              <span className="value">{selectedShowtime}</span>
            </div>
          </div>
        </div>

        <div className="seat-selection-layout">
          {/* Seat Map */}
          <div className="seat-map-container">
            <div className="screen">
              <div className="screen-curve"></div>
              <span>SCREEN</span>
            </div>

            <div className="seat-map">
              {seats.map((row) => (
                <div key={row.row} className="seat-row">
                  <span className="row-label">{row.row}</span>
                  <div className="seats">
                    {row.seats.map((seat, index) => (
                      <button
                        key={seat.id}
                        className={`seat ${seat.type} ${
                          seat.isBooked ? 'booked' : ''
                        } ${selectedSeats.some(s => s.id === seat.id) ? 'selected' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.isBooked}
                        style={{ 
                          marginRight: index === 3 || index === 11 ? '20px' : '4px' 
                        }}
                        title={seat.isBooked ? 'Already Booked' : `${seat.id} - ₹${seat.price}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                  <span className="row-label">{row.row}</span>
                </div>
              ))}
            </div>

            {/* Seat Legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-seat available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat booked"></div>
                <span>Booked</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat premium"></div>
                <span>Premium (₹{seatPrices.premium})</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat vip"></div>
                <span>VIP (₹{seatPrices.vip})</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat regular"></div>
                <span>Regular (₹{seatPrices.regular})</span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary">
            <h3 className="summary-title">
              <i className="fas fa-receipt"></i>
              Booking Summary
            </h3>

            <div className="summary-movie">
              <img src={selectedMovie.poster} alt={selectedMovie.title} />
              <div>
                <h4>{selectedMovie.title}</h4>
                <p>{selectedTheater?.name}</p>
                <p>{formatDate(selectedDate)} • {selectedShowtime}</p>
              </div>
            </div>

            <div className="summary-seats">
              <h4>Selected Seats ({selectedSeats.length})</h4>
              {selectedSeats.length > 0 ? (
                <div className="selected-seats-list">
                  {selectedSeats.map(seat => (
                    <span key={seat.id} className="selected-seat-tag">
                      {seat.id}
                      <button 
                        className="remove-seat"
                        onClick={() => handleSeatClick(seat)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-seats">No seats selected</p>
              )}
            </div>

            <div className="price-breakdown">
              {['premium', 'vip', 'regular'].map(type => {
                const typeSeats = selectedSeats.filter(s => s.type === type);
                if (typeSeats.length === 0) return null;
                return (
                  <div key={type} className="price-row">
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} x {typeSeats.length}</span>
                    <span>₹{typeSeats.length * seatPrices[type]}</span>
                  </div>
                );
              })}
              <div className="price-row convenience">
                <span>Convenience Fee</span>
                <span>₹{selectedSeats.length > 0 ? 49 : 0}</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span>₹{selectedSeats.length > 0 ? totalPrice + 49 : 0}</span>
              </div>
            </div>

            <button
              className={`btn btn-primary btn-block ${selectedSeats.length === 0 ? 'disabled' : ''}`}
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
            >
              <i className="fas fa-credit-card"></i>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeatSelection;
