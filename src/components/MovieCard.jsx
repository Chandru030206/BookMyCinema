import { useNavigate } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie, isComingSoon = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isComingSoon) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="movie-poster">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
          }}
        />
        <div className="movie-rating">
          <i className="fas fa-star"></i> {movie.rating}
        </div>
        <div className="movie-overlay">
          {isComingSoon ? (
            <button className="btn btn-secondary btn-book">
              <i className="fas fa-bell"></i> Notify Me
            </button>
          ) : (
            <button className="btn btn-primary btn-book" onClick={handleBookNow}>
              <i className="fas fa-ticket-alt"></i> Book Now
            </button>
          )}
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-genre">{movie.genre}</p>
        <div className="movie-meta-small">
          <span><i className="fas fa-clock"></i> {movie.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
