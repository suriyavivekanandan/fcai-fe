import axios from 'axios';

const API_URL_FOOD = 'http://localhost:5000/api/v1/food-entry';
const API_URL_BOOKING = 'http://localhost:5000/api/v1/booking'; // Fixed endpoint

const bookingService = {
  // Get available food (with remaining weight > 0)
  getAvailableFood: async () => {
    try {
      const response = await axios.get(`${API_URL_FOOD}`); // Use the dedicated endpoint
      return response.data;
    } catch (error) {
      console.error('Error fetching available food:', error);
      throw error;
    }
  },

  // Get all food entries
  getAllFood: async () => {
    try {
      const response = await axios.get(`${API_URL_FOOD}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all food entries:', error);
      throw error;
    }
  },

  // Get all bookings
  getAllBookings: async () => {
    try {
      const response = await axios.get(`${API_URL_BOOKING}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Create a booking
  createBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_URL_BOOKING}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Delete a booking
  deleteBooking: async (id) => {
    try {
      const response = await axios.delete(`${API_URL_BOOKING}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Get a specific booking by ID
  getBookingById: async (id) => {
    try {
      const response = await axios.get(`${API_URL_BOOKING}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }
};

export default bookingService;