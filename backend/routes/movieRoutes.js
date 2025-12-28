/**
 * BookMyCinema - Movie Routes
 * 
 * Handles movie listing and details
 */

const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

/**
 * GET /api/movies
 * Get all movies with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { genre, search, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM movies WHERE 1=1';
    const params = [];

    // Filter by genre
    if (genre && genre !== 'all') {
      sql += ' AND genre LIKE ?';
      params.push(`%${genre}%`);
    }

    // Search by title
    if (search) {
      sql += ' AND (title LIKE ? OR genre LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Order by rating
    sql += ' ORDER BY rating DESC';

    // Pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const movies = await query(sql, params);

    // Transform to match frontend expected format
    const transformedMovies = movies.map(movie => ({
      id: movie.movie_id,
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: parseFloat(movie.rating),
      poster: movie.poster_url,
      description: movie.description,
      language: movie.language,
      releaseDate: movie.release_date,
      director: movie.director,
      cast: movie.cast_members ? movie.cast_members.split(', ') : []
    }));

    res.json({
      success: true,
      data: transformedMovies,
      count: transformedMovies.length
    });

  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies'
    });
  }
});

/**
 * GET /api/movies/:id
 * Get movie details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const movies = await query(
      'SELECT * FROM movies WHERE movie_id = ?',
      [id]
    );

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const movie = movies[0];

    // Transform to match frontend expected format
    const transformedMovie = {
      id: movie.movie_id,
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: parseFloat(movie.rating),
      poster: movie.poster_url,
      description: movie.description,
      language: movie.language,
      releaseDate: movie.release_date,
      director: movie.director,
      cast: movie.cast_members ? movie.cast_members.split(', ') : []
    };

    res.json({
      success: true,
      data: transformedMovie
    });

  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie details'
    });
  }
});

/**
 * GET /api/movies/:id/genres
 * Get all unique genres
 */
router.get('/meta/genres', async (req, res) => {
  try {
    const movies = await query('SELECT DISTINCT genre FROM movies');
    
    // Extract unique genres
    const allGenres = new Set();
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(', ').forEach(g => allGenres.add(g.trim()));
      }
    });

    res.json({
      success: true,
      data: ['all', ...Array.from(allGenres).sort()]
    });

  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genres'
    });
  }
});

module.exports = router;
