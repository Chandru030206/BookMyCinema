/**
 * BookMyCinema - Seat Routes
 * 
 * Handles seat layout and booking with double-booking prevention
 */

const express = require('express');
const { query, getConnection } = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/seats/:showId
 * Get seat layout and availability for a show
 */
router.get('/:showId', async (req, res) => {
  try {
    const { showId } = req.params;

    // Verify show exists
    const shows = await query('SELECT * FROM shows WHERE show_id = ?', [showId]);
    if (shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Clear expired locks (locks older than 10 minutes)
    await query(`
      UPDATE seats 
      SET status = 'available', locked_until = NULL 
      WHERE show_id = ? AND status = 'locked' AND locked_until < NOW()
    `, [showId]);

    // Get all seats for this show
    const seats = await query(`
      SELECT seat_id, seat_number, seat_type, price, status
      FROM seats
      WHERE show_id = ?
      ORDER BY seat_number
    `, [showId]);

    // Organize seats by row
    const seatLayout = {};
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    rows.forEach(row => {
      seatLayout[row] = [];
    });

    seats.forEach(seat => {
      const row = seat.seat_number.charAt(0);
      if (seatLayout[row]) {
        seatLayout[row].push({
          id: seat.seat_number,
          seatId: seat.seat_id,
          number: parseInt(seat.seat_number.substring(1)),
          type: seat.seat_type,
          price: parseFloat(seat.price),
          isBooked: seat.status === 'booked',
          isLocked: seat.status === 'locked'
        });
      }
    });

    // Sort seats by number in each row
    Object.keys(seatLayout).forEach(row => {
      seatLayout[row].sort((a, b) => a.number - b.number);
    });

    // Get price summary
    const prices = {
      premium: 450,
      vip: 350,
      regular: 200
    };

    res.json({
      success: true,
      data: {
        showId: parseInt(showId),
        show: {
          movieId: shows[0].movie_id,
          theaterId: shows[0].theater_id,
          date: shows[0].show_date,
          time: shows[0].show_time,
          basePrice: parseFloat(shows[0].price)
        },
        seatLayout,
        prices,
        totalSeats: seats.length,
        availableSeats: seats.filter(s => s.status === 'available').length,
        bookedSeats: seats.filter(s => s.status === 'booked').length
      }
    });

  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat layout'
    });
  }
});

/**
 * POST /api/seats/lock
 * Temporarily lock seats for booking (prevents double booking)
 */
router.post('/lock', authenticate, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const { showId, seatIds } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat IDs are required'
      });
    }

    if (seatIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 seats allowed per booking'
      });
    }

    await connection.beginTransaction();

    // Clear expired locks
    await connection.execute(`
      UPDATE seats 
      SET status = 'available', locked_until = NULL 
      WHERE show_id = ? AND status = 'locked' AND locked_until < NOW()
    `, [showId]);

    // Check if all seats are available
    const placeholders = seatIds.map(() => '?').join(',');
    const [seats] = await connection.execute(`
      SELECT seat_number, status 
      FROM seats 
      WHERE show_id = ? AND seat_number IN (${placeholders})
      FOR UPDATE
    `, [showId, ...seatIds]);

    // Check for unavailable seats
    const unavailableSeats = seats.filter(s => s.status !== 'available');
    if (unavailableSeats.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats.map(s => s.seat_number)
      });
    }

    // Lock the seats for 10 minutes
    const lockUntil = new Date(Date.now() + 10 * 60 * 1000);
    await connection.execute(`
      UPDATE seats 
      SET status = 'locked', locked_until = ?
      WHERE show_id = ? AND seat_number IN (${placeholders})
    `, [lockUntil, showId, ...seatIds]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Seats locked successfully',
      data: {
        showId,
        seatIds,
        lockExpiresAt: lockUntil.toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Lock seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lock seats'
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/seats/unlock
 * Release locked seats
 */
router.post('/unlock', authenticate, async (req, res) => {
  try {
    const { showId, seatIds } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat IDs are required'
      });
    }

    const placeholders = seatIds.map(() => '?').join(',');
    await query(`
      UPDATE seats 
      SET status = 'available', locked_until = NULL 
      WHERE show_id = ? AND seat_number IN (${placeholders}) AND status = 'locked'
    `, [showId, ...seatIds]);

    res.json({
      success: true,
      message: 'Seats unlocked successfully'
    });

  } catch (error) {
    console.error('Unlock seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock seats'
    });
  }
});

/**
 * POST /api/seats/book
 * Book seats (mark as permanently booked)
 */
router.post('/book', authenticate, async (req, res) => {
  const connection = await getConnection();
  
  try {
    const { showId, seatIds } = req.body;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat IDs are required'
      });
    }

    await connection.beginTransaction();

    // Check if all seats are either available or locked by this user
    const placeholders = seatIds.map(() => '?').join(',');
    const [seats] = await connection.execute(`
      SELECT seat_number, status, price, seat_type
      FROM seats 
      WHERE show_id = ? AND seat_number IN (${placeholders})
      FOR UPDATE
    `, [showId, ...seatIds]);

    // Verify all seats can be booked
    const unbookableSeats = seats.filter(s => s.status === 'booked');
    if (unbookableSeats.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Some seats are already booked',
        bookedSeats: unbookableSeats.map(s => s.seat_number)
      });
    }

    // Book the seats
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

    // Calculate total price
    const totalPrice = seats.reduce((sum, seat) => sum + parseFloat(seat.price), 0);

    res.json({
      success: true,
      message: 'Seats booked successfully',
      data: {
        showId,
        bookedSeats: seatIds,
        totalPrice,
        seatDetails: seats.map(s => ({
          seatNumber: s.seat_number,
          type: s.seat_type,
          price: parseFloat(s.price)
        }))
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Book seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book seats'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
