/**
 * BookMyCinema - API Service
 * 
 * Centralized API calls to backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get stored auth token
 */
const getToken = () => {
  return localStorage.getItem('bookmycinema_token');
};

/**
 * Set auth token
 */
const setToken = (token) => {
  localStorage.setItem('bookmycinema_token', token);
};

/**
 * Remove auth token
 */
const removeToken = () => {
  localStorage.removeItem('bookmycinema_token');
  localStorage.removeItem('bookmycinema_user');
};

/**
 * Get stored user info
 */
const getUser = () => {
  const user = localStorage.getItem('bookmycinema_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set user info
 */
const setUser = (user) => {
  localStorage.setItem('bookmycinema_user', JSON.stringify(user));
};

/**
 * Make API request with proper headers
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401) {
      removeToken();
      // Optionally redirect to login
      if (data.message?.includes('expired')) {
        window.location.href = '/login';
      }
    }
    
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { 
      ok: false, 
      status: 500, 
      data: { success: false, message: 'Network error. Please try again.' }
    };
  }
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Register new user
   */
  register: async (name, email, password) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.ok && response.data.success) {
      setToken(response.data.data.token);
      setUser(response.data.data.user);
    }
    
    return response;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok && response.data.success) {
      setToken(response.data.data.token);
      setUser(response.data.data.user);
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: () => {
    removeToken();
    return { ok: true, data: { success: true, message: 'Logged out successfully' }};
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  /**
   * Verify if token is valid
   */
  verifyToken: async () => {
    return apiRequest('/auth/verify', { method: 'POST' });
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: () => {
    return !!getToken();
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: getUser,

  /**
   * Get token
   */
  getToken
};

// ============================================
// MOVIES API
// ============================================

export const moviesAPI = {
  /**
   * Get all movies
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/movies${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get movie by ID
   */
  getById: async (id) => {
    return apiRequest(`/movies/${id}`);
  },

  /**
   * Get all genres
   */
  getGenres: async () => {
    return apiRequest('/movies/meta/genres');
  }
};

// ============================================
// SHOWS API
// ============================================

export const showsAPI = {
  /**
   * Get shows for a movie
   */
  getByMovie: async (movieId, date = null) => {
    const queryString = date ? `?date=${date}` : '';
    return apiRequest(`/shows/${movieId}${queryString}`);
  },

  /**
   * Get show details
   */
  getDetails: async (showId) => {
    return apiRequest(`/shows/details/${showId}`);
  },

  /**
   * Get available dates for a movie
   */
  getDates: async (movieId) => {
    return apiRequest(`/shows/dates/${movieId}`);
  }
};

// ============================================
// SEATS API
// ============================================

export const seatsAPI = {
  /**
   * Get seat layout for a show
   */
  getLayout: async (showId) => {
    return apiRequest(`/seats/${showId}`);
  },

  /**
   * Lock seats temporarily
   */
  lock: async (showId, seatIds) => {
    return apiRequest('/seats/lock', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds })
    });
  },

  /**
   * Unlock seats
   */
  unlock: async (showId, seatIds) => {
    return apiRequest('/seats/unlock', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds })
    });
  },

  /**
   * Book seats
   */
  book: async (showId, seatIds) => {
    return apiRequest('/seats/book', {
      method: 'POST',
      body: JSON.stringify({ showId, seatIds })
    });
  }
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsAPI = {
  /**
   * Create a new booking
   */
  create: async (showId, seats, totalPrice) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({ showId, seats, totalPrice })
    });
  },

  /**
   * Get user's bookings
   */
  getUserBookings: async (userId) => {
    return apiRequest(`/bookings/user/${userId}`);
  },

  /**
   * Get booking by ID
   */
  getById: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}`);
  }
};

// ============================================
// PAYMENT API
// ============================================

export const paymentAPI = {
  /**
   * Process payment
   */
  process: async (bookingId, paymentMethod, cardDetails = null) => {
    return apiRequest('/payment', {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentMethod, cardDetails })
    });
  },

  /**
   * Verify payment status
   */
  verify: async (bookingId) => {
    return apiRequest('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
  },

  /**
   * Request refund
   */
  refund: async (bookingId, reason = '') => {
    return apiRequest('/payment/refund', {
      method: 'POST',
      body: JSON.stringify({ bookingId, reason })
    });
  }
};

// Export all APIs
export default {
  auth: authAPI,
  movies: moviesAPI,
  shows: showsAPI,
  seats: seatsAPI,
  bookings: bookingsAPI,
  payment: paymentAPI
};
