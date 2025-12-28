/**
 * BookMyCinema - Payment Routes
 * 
 * Handles mock payment processing
 */

const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/payment
 * Process payment for a booking
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Get booking
    const bookings = await query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Verify user owns this booking
    if (booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already paid
    if (booking.payment_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Simulate payment processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Mock payment - 95% success rate
    const paymentSuccess = Math.random() > 0.05;

    if (!paymentSuccess) {
      // Update booking status to failed
      await query(
        'UPDATE bookings SET payment_status = ? WHERE booking_id = ?',
        ['failed', bookingId]
      );

      return res.status(402).json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: {
          bookingId,
          paymentStatus: 'failed'
        }
      });
    }

    // Update booking status to completed
    await query(
      'UPDATE bookings SET payment_status = ? WHERE booking_id = ?',
      ['completed', bookingId]
    );

    // Generate transaction ID
    const transactionId = `TXN${Date.now().toString(36).toUpperCase()}`;

    // Get updated booking details
    const [updatedBooking] = await query(`
      SELECT b.*, s.show_date, s.show_time,
             m.title as movie_title, m.poster_url,
             t.name as theater_name, t.location as theater_location
      FROM bookings b
      INNER JOIN shows s ON b.show_id = s.show_id
      INNER JOIN movies m ON s.movie_id = m.movie_id
      INNER JOIN theaters t ON s.theater_id = t.theater_id
      WHERE b.booking_id = ?
    `, [bookingId]);

    res.json({
      success: true,
      message: 'Payment successful! Your booking is confirmed.',
      data: {
        transactionId,
        bookingId,
        paymentStatus: 'completed',
        paymentMethod,
        amount: parseFloat(booking.total_price),
        paidAt: new Date().toISOString(),
        booking: {
          movie: {
            title: updatedBooking.movie_title,
            poster: updatedBooking.poster_url
          },
          theater: {
            name: updatedBooking.theater_name,
            location: updatedBooking.theater_location
          },
          showDate: updatedBooking.show_date,
          showTime: updatedBooking.show_time,
          seats: JSON.parse(updatedBooking.seats),
          totalPrice: parseFloat(updatedBooking.total_price)
        }
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed. Please try again.'
    });
  }
});

/**
 * POST /api/payment/verify
 * Verify payment status
 */
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const bookings = await query(
      'SELECT booking_id, payment_status, total_price FROM bookings WHERE booking_id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    res.json({
      success: true,
      data: {
        bookingId: booking.booking_id,
        paymentStatus: booking.payment_status,
        amount: parseFloat(booking.total_price),
        isPaid: booking.payment_status === 'completed'
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

/**
 * POST /api/payment/refund
 * Request refund for a booking
 */
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user.userId;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const bookings = await query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (booking.payment_status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    // Process refund (mock)
    await query(
      'UPDATE bookings SET payment_status = ? WHERE booking_id = ?',
      ['refunded', bookingId]
    );

    // Release the seats
    const seatIds = JSON.parse(booking.seats);
    const placeholders = seatIds.map(() => '?').join(',');
    await query(`
      UPDATE seats 
      SET status = 'available'
      WHERE show_id = ? AND seat_number IN (${placeholders})
    `, [booking.show_id, ...seatIds]);

    // Update available seats count
    await query(`
      UPDATE shows 
      SET available_seats = available_seats + ?
      WHERE show_id = ?
    `, [seatIds.length, booking.show_id]);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        bookingId,
        refundAmount: parseFloat(booking.total_price),
        refundedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

module.exports = router;
