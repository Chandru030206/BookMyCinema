import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Beams from '../components/Beams';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { moviesData } from '../data/movies';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [movies, setMovies] = useState(moviesData); // Use static data as default
  const [loading, setLoading] = useState(true);

  // Fetch movies from API on mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.getMovies();
        if (data && data.length > 0) {
          setMovies(data);
        }
      } catch (error) {
        console.log('Using static movie data:', error.message);
        // Keep using static data on error
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Extract unique genres from movies
  const genres = useMemo(() => {
    const allGenres = movies.flatMap(movie => 
      movie.genre.split(', ').map(g => g.trim())
    );
    return ['all', ...new Set(allGenres)];
  }, [movies]);

  // Filter movies based on search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || 
                          movie.genre.toLowerCase().includes(selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  // Get featured movies (top rated)
  const featuredMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 4);
  }, [movies]);

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section with Beams */}
      <section className="hero">
        <div className="hero-beams">
          <Beams />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-accent">BookMyCinema</span>
            <span>Your Gateway to Cinema Magic</span>
          </h1>
          <p className="hero-description">
            Experience the thrill of movies like never before. Book your seats,
            choose your show, and immerse yourself in cinematic excellence.
          </p>
          <div className="hero-buttons">
            <a href="#now-showing" className="btn btn-primary">
              <i className="fas fa-play"></i>
              Explore Movies
            </a>
            <Link to="/movie/1" className="btn btn-secondary">
              <i className="fas fa-info-circle"></i>
              Featured Film
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Movies</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Theaters</span>
            </div>
            <div className="stat">
              <span className="stat-number">1M+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to Explore</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-star"></i>
              Featured Movies
            </h2>
          </div>
          <div className="featured-grid">
            {featuredMovies.map((movie, index) => (
              <div key={movie.id} className="featured-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <Link to={`/movie/${movie.id}`}>
                  <div className="featured-poster">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="featured-overlay">
                      <div className="featured-rating">
                        <i className="fas fa-star"></i>
                        {movie.rating}
                      </div>
                      <h3>{movie.title}</h3>
                      <p>{movie.genre}</p>
                      <button className="btn btn-primary">Book Now</button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section id="now-showing" className="section now-showing-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-film"></i>
              Now Showing
            </h2>
          </div>

          {/* Search and Filter */}
          <div className="filters">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="genre-filters">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Movies Grid */}
          <div className="movies-grid">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No movies found matching your criteria</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => { setSearchQuery(''); setSelectedGenre('all'); }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-magic"></i>
              Why Choose BookMyCinema?
            </h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Instant Booking</h3>
              <p>Book your tickets in seconds with our fast and secure booking system</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-couch"></i>
              </div>
              <h3>Best Seats</h3>
              <p>Choose from premium, VIP, or regular seats with our interactive seat map</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-percent"></i>
              </div>
              <h3>Exclusive Offers</h3>
              <p>Get access to exclusive discounts and early bird offers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure Payments</h3>
              <p>Multiple secure payment options including cards and wallets</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
