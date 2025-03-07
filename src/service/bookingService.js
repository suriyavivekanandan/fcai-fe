import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/bookings'; // Update with your actual backend URL

const bookingService = {
  // Fetch all available food entries
  getAvailableFood: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available food:', error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Fetch all bookings
  getBookings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },
};

// Default export
export default bookingService;
