/**
 * BookMyCinema - Booking Routes
 * 
 * Handles booking creation and history
 */

const express = require('express');
const { query, getConnection } = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Generate unique booking ID
 */
const generateBookingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB${timestamp}${random}`;
};

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', authenticate, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const { showId, seats, totalPrice } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seats are required'
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total price is required'
      });
    }

    await connection.beginTransaction();

    // Verify show exists
    const [shows] = await connection.execute(
      'SELECT * FROM shows WHERE show_id = ?',
      [showId]
    );

    if (shows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Extract seat IDs from seat objects or use directly if strings
    const seatIds = seats.map(s => typeof s === 'object' ? s.id : s);
    
    // Verify seats are available or locked
    const placeholders = seatIds.map(() => '?').join(',');
    const [seatRecords] = await connection.execute(`
      SELECT seat_number, status 
      FROM seats 
      WHERE show_id = ? AND seat_number IN (${placeholders})
      FOR UPDATE
    `, [showId, ...seatIds]);

    const unavailableSeats = seatRecords.filter(s => s.status === 'booked');
    if (unavailableSeats.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats.map(s => s.seat_number)
      });
    }

    // Generate booking ID
    const bookingId = generateBookingId();

    // Create booking record
    await connection.execute(`
      INSERT INTO bookings (booking_id, user_id, show_id, seats, total_price, payment_status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [bookingId, userId, showId, JSON.stringify(seatIds), totalPrice]);

    // Mark seats as booked
    await connection.execute(`
      UPDATE seats 
      SET status = 'booked', locked_until = NULL
      WHERE show_id = ? AND seat_number IN (${placeholders})
    `, [showId, ...seatIds]);

    // Update available seats count
    await connection.execute(`
      UPDATE shows 
      SET available_seats = available_seats - ?
      WHERE show_id = ?
    `, [seatIds.length, showId]);

    await connection.commit();

    // Get booking details for response
    const [bookingDetails] = await connection.execute(`
      SELECT b.*, s.show_date, s.show_time, s.price as show_price,
             m.title as movie_title, m.poster_url,
             t.name as theater_name, t.location as theater_location
      FROM bookings b
      INNER JOIN shows s ON b.show_id = s.show_id
      INNER JOIN movies m ON s.movie_id = m.movie_id
      INNER JOIN theaters t ON s.theater_id = t.theater_id
      WHERE b.booking_id = ?
    `, [bookingId]);

    const booking = bookingDetails[0];

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: booking.booking_id,
        movie: {
          title: booking.movie_title,
          poster: booking.poster_url
        },
        theater: {
          name: booking.theater_name,
          location: booking.theater_location
        },
        showDate: booking.show_date,
        showTime: booking.show_time,
        seats: JSON.parse(booking.seats),
        totalPrice: parseFloat(booking.total_price),
        paymentStatus: booking.payment_status,
        bookingTime: booking.booking_time
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/bookings/user/:userId
 * Get booking history for a user
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own bookings
    if (parseInt(userId) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const bookings = await query(`
      SELECT b.*, s.show_date, s.show_time,
             m.title as movie_title, m.poster_url, m.genre, m.duration,
             t.name as theater_name, t.location as theater_location
      FROM bookings b
      INNER JOIN shows s ON b.show_id = s.show_id
      INNER JOIN movies m ON s.movie_id = m.movie_id
      INNER JOIN theaters t ON s.theater_id = t.theater_id
      WHERE b.user_id = ?
      ORDER BY b.booking_time DESC
    `, [userId]);

    const transformedBookings = bookings.map(booking => ({
      bookingId: booking.booking_id,
      movie: {
        title: booking.movie_title,
        poster: booking.poster_url,
        genre: booking.genre,
        duration: booking.duration
      },
      theater: {
        name: booking.theater_name,
        location: booking.theater_location
      },
      showDate: booking.show_date,
      showTime: booking.show_time,
      seats: JSON.parse(booking.seats),
      totalPrice: parseFloat(booking.total_price),
      paymentStatus: booking.payment_status,
      bookingTime: booking.booking_time
    }));

    res.json({
      success: true,
      data: transformedBookings,
      count: transformedBookings.length
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * GET /api/bookings/:bookingId
 * Get specific booking details
 */
router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const bookings = await query(`
      SELECT b.*, s.show_date, s.show_time,
             m.title as movie_title, m.poster_url, m.genre, m.duration,
             t.name as theater_name, t.location as theater_location
      FROM bookings b
      INNER JOIN shows s ON b.show_id = s.show_id
      INNER JOIN movies m ON s.movie_id = m.movie_id
      INNER JOIN theaters t ON s.theater_id = t.theater_id
      WHERE b.booking_id = ?
    `, [bookingId]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Verify user owns this booking
    if (booking.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking.booking_id,
        movie: {
          title: booking.movie_title,
          poster: booking.poster_url,
          genre: booking.genre,
          duration: booking.duration
        },
        theater: {
          name: booking.theater_name,
          location: booking.theater_location
        },
        showDate: booking.show_date,
        showTime: booking.show_time,
        seats: JSON.parse(booking.seats),
        totalPrice: parseFloat(booking.total_price),
        paymentStatus: booking.payment_status,
        bookingTime: booking.booking_time
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

module.exports = router;
