import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { moviesData, theatersData } from '../data/movies';
import api from '../services/api';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedTheater, setSelectedDate, setSelectedShowtime } = useBooking();

  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState(theatersData);
  const [selectedDateState, setSelectedDateState] = useState('');
  const [selectedTheaterState, setSelectedTheaterState] = useState('');
  const [selectedShowtimeState, setSelectedShowtimeState] = useState('');
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch movie from API
        const movieData = await api.getMovieById(id);
        if (movieData) {
          setMovie(movieData);
          setSelectedMovie(movieData);
        }
      } catch (error) {
        console.log('Using static movie data:', error.message);
        // Fall back to static data
        const foundMovie = moviesData.find(m => m.id === parseInt(id));
        if (foundMovie) {
          setMovie(foundMovie);
          setSelectedMovie(foundMovie);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Generate next 7 days for date selection
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        full: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    setAvailableDates(dates);
    setSelectedDateState(dates[0].full);
    setSelectedDate(dates[0].full);
  }, [id, setSelectedMovie, setSelectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDateState(date.full);
    setSelectedDate(date.full);
    setSelectedShowtimeState('');
  };

  const handleTheaterSelect = (theater) => {
    setSelectedTheaterState(theater.id);
    setSelectedTheater(theater);
    setSelectedShowtimeState('');
  };

  const handleShowtimeSelect = (showtime, showId = null) => {
    setSelectedShowtimeState(showtime);
    setSelectedShowtime(showtime);
    if (showId) {
      setSelectedShowId(showId);
    }
  };

  const handleProceed = () => {
    if (selectedTheaterState && selectedShowtimeState) {
      // Pass showId in state if available for API-based booking
      navigate('/seats', { state: { showId: selectedShowId } });
    }
  };

  if (!movie) {
    return (
      <div className="movie-details-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      <Navbar />

      {/* Hero Banner */}
      <section className="movie-banner">
        <div className="banner-bg" style={{ backgroundImage: `url(${movie.poster})` }}></div>
        <div className="banner-overlay"></div>
        <div className="banner-content container">
          <div className="movie-poster-large">
            <img src={movie.poster} alt={movie.title} />
          </div>
          <div className="movie-info-detailed">
            <div className="movie-badges">
              <span className="badge rating-badge">
                <i className="fas fa-star"></i> {movie.rating}
              </span>
              <span className="badge">{movie.duration}</span>
              <span className="badge">UA</span>
            </div>
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-genres">
              {movie.genre.split(', ').map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-meta">
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>Release: {movie.releaseDate}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-globe"></i>
                <span>Language: {movie.language}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-clock"></i>
                <span>Duration: {movie.duration}</span>
              </div>
            </div>

            <div className="movie-actions">
              <button className="btn btn-secondary">
                <i className="fas fa-play"></i>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cast Section */}
      <section className="section cast-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-users"></i>
            Cast & Crew
          </h2>
          <div className="cast-grid">
            {movie.cast.map((actor, index) => (
              <div key={index} className="cast-card">
                <div className="cast-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <span className="cast-name">{actor}</span>
                <span className="cast-role">Actor</span>
              </div>
            ))}
            <div className="cast-card">
              <div className="cast-avatar director">
                <i className="fas fa-video"></i>
              </div>
              <span className="cast-name">{movie.director}</span>
              <span className="cast-role">Director</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="section booking-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-ticket-alt"></i>
            Book Your Tickets
          </h2>

          {/* Date Selection */}
          <div className="booking-step">
            <h3 className="step-title">Select Date</h3>
            <div className="date-selector">
              {availableDates.map((date, index) => (
                <button
                  key={index}
                  className={`date-btn ${selectedDateState === date.full ? 'active' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="date-day">{date.day}</span>
                  <span className="date-num">{date.date}</span>
                  <span className="date-month">{date.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theater Selection */}
          <div className="booking-step">
            <h3 className="step-title">Select Theater</h3>
            <div className="theaters-list">
              {theatersData.map((theater) => (
                <div
                  key={theater.id}
                  className={`theater-card ${selectedTheaterState === theater.id ? 'active' : ''}`}
                  onClick={() => handleTheaterSelect(theater)}
                >
                  <div className="theater-info">
                    <h4 className="theater-name">{theater.name}</h4>
                    <p className="theater-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {theater.location}
                    </p>
                    <div className="theater-amenities">
                      {theater.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-badge">
                          <i className={`fas ${getAmenityIcon(amenity)}`}></i>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="showtimes">
                    {theater.showtimes.map((time, index) => (
                      <button
                        key={index}
                        className={`showtime-btn ${
                          selectedTheaterState === theater.id && selectedShowtimeState === (typeof time === 'object' ? time.time : time)
                            ? 'active'
                            : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTheaterSelect(theater);
                          // Handle both object format (from API) and string format (static data)
                          if (typeof time === 'object') {
                            handleShowtimeSelect(time.time, time.showId);
                          } else {
                            handleShowtimeSelect(time);
                          }
                        }}
                      >
                        {typeof time === 'object' ? time.time : time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proceed Button */}
          <div className="booking-action">
            <button
              className={`btn btn-primary btn-large ${
                !selectedTheaterState || !selectedShowtimeState ? 'disabled' : ''
              }`}
              onClick={handleProceed}
              disabled={!selectedTheaterState || !selectedShowtimeState}
            >
              <i className="fas fa-arrow-right"></i>
              Proceed to Seat Selection
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Helper function for amenity icons
const getAmenityIcon = (amenity) => {
  const icons = {
    'Dolby Atmos': 'fa-volume-up',
    'IMAX': 'fa-film',
    '4K': 'fa-tv',
    'Recliner': 'fa-couch',
    'Food Court': 'fa-utensils',
    'Parking': 'fa-parking',
    'Wheelchair': 'fa-wheelchair'
  };
  return icons[amenity] || 'fa-check';
};

export default MovieDetails;
