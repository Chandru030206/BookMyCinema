import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Booking state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null); // Contains showId for API
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentBooking, setCurrentBooking] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isLoggedIn()) {
        const storedUser = authAPI.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Auth functions
  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password);
    if (response.ok && response.data.success) {
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
    if (response.ok && response.data.success) {
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    resetBooking();
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedMovie(null);
    setSelectedTheater(null);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setSelectedShow(null);
    setSelectedSeats([]);
    setTotalPrice(0);
    setCurrentBooking(null);
  }, []);

  const value = {
    // Auth
    user,
    isAuthenticated,
    authLoading,
    login,
    register,
    logout,
    // Booking
    selectedMovie,
    setSelectedMovie,
    selectedTheater,
    setSelectedTheater,
    selectedDate,
    setSelectedDate,
    selectedShowtime,
    setSelectedShowtime,
    selectedShow,
    setSelectedShow,
    selectedSeats,
    setSelectedSeats,
    totalPrice,
    setTotalPrice,
    currentBooking,
    setCurrentBooking,
    resetBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
