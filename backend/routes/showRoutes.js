/**
 * BookMyCinema - Show Routes
 * 
 * Handles theaters and showtimes for movies
 */

const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

/**
 * GET /api/shows/:movieId
 * Get all theaters and showtimes for a movie
 */
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    // Default to today if no date provided
    const showDate = date || new Date().toISOString().split('T')[0];

    // Verify movie exists
    const movies = await query('SELECT movie_id FROM movies WHERE movie_id = ?', [movieId]);
    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Get theaters with shows for this movie on this date
    const theaters = await query(`
      SELECT DISTINCT t.theater_id, t.name, t.location, t.amenities
      FROM theaters t
      INNER JOIN shows s ON t.theater_id = s.theater_id
      WHERE s.movie_id = ? AND s.show_date = ?
      ORDER BY t.name
    `, [movieId, showDate]);

    // Get showtimes for each theater
    const result = await Promise.all(theaters.map(async (theater) => {
      const shows = await query(`
        SELECT show_id, show_time, price, available_seats
        FROM shows
        WHERE movie_id = ? AND theater_id = ? AND show_date = ?
        ORDER BY show_time
      `, [movieId, theater.theater_id, showDate]);

      return {
        id: theater.theater_id,
        name: theater.name,
        location: theater.location,
        amenities: theater.amenities ? theater.amenities.split(', ') : [],
        showtimes: shows.map(show => ({
          showId: show.show_id,
          time: show.show_time,
          price: parseFloat(show.price),
          availableSeats: show.available_seats
        }))
      };
    }));

    res.json({
      success: true,
      data: {
        movieId: parseInt(movieId),
        date: showDate,
        theaters: result
      }
    });

  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showtimes'
    });
  }
});

/**
 * GET /api/shows/details/:showId
 * Get specific show details
 */
router.get('/details/:showId', async (req, res) => {
  try {
    const { showId } = req.params;

    const shows = await query(`
      SELECT s.*, m.title as movie_title, m.poster_url, m.duration,
             t.name as theater_name, t.location as theater_location
      FROM shows s
      INNER JOIN movies m ON s.movie_id = m.movie_id
      INNER JOIN theaters t ON s.theater_id = t.theater_id
      WHERE s.show_id = ?
    `, [showId]);

    if (shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    const show = shows[0];

    res.json({
      success: true,
      data: {
        showId: show.show_id,
        movie: {
          id: show.movie_id,
          title: show.movie_title,
          poster: show.poster_url,
          duration: show.duration
        },
        theater: {
          id: show.theater_id,
          name: show.theater_name,
          location: show.theater_location
        },
        date: show.show_date,
        time: show.show_time,
        price: parseFloat(show.price),
        availableSeats: show.available_seats
      }
    });

  } catch (error) {
    console.error('Get show details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch show details'
    });
  }
});

/**
 * GET /api/shows/dates/:movieId
 * Get available dates for a movie
 */
router.get('/dates/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    const dates = await query(`
      SELECT DISTINCT show_date
      FROM shows
      WHERE movie_id = ? AND show_date >= CURDATE()
      ORDER BY show_date
      LIMIT 7
    `, [movieId]);

    res.json({
      success: true,
      data: dates.map(d => d.show_date)
    });

  } catch (error) {
    console.error('Get dates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available dates'
    });
  }
});

module.exports = router;
