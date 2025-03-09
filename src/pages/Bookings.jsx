import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import bookingService from '../service/bookingService';


function Bookings() {
  const [availableFood, setAvailableFood] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    person_name: '',
    contact_number: '',
    trust_name: ''
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [justBookedId, setJustBookedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [food, allBookings] = await Promise.all([
        bookingService.getAvailableFood(),
        bookingService.getAllBookings()
      ]);

      setAvailableFood(food);
      setBookings(allBookings);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedEntry) {
      alert('Please select a food item.');
      return;
    }

    try {
      setLoading(true);
      await bookingService.createBooking({
        food_entry_id: selectedEntry._id,
        ...formData
      });

      setJustBookedId(selectedEntry._id); // Lock this card

      setFormData({
        person_name: '',
        contact_number: '',
        trust_name: ''
      });
      setSelectedEntry(null);

      await fetchData();
      alert('Booking created successfully!');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoading(true);
      await bookingService.deleteBooking(id);
      alert('Booking cancelled successfully!');
      await fetchData();
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !availableFood.length && !bookings.length) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="page-header">
        <h1>Food Waste Management System</h1>
      </div>

      <div className="content-grid">
        {/* Available Food Section */}
        <div className="section">
          <h2>Available Food</h2>
          {availableFood.length === 0 ? (
            <div className="empty-state">
              <p>No food available for booking at the moment.</p>
            </div>
          ) : (
            <div className="food-grid">
              {availableFood.map(food => {
                const isBooked = food._id === justBookedId;
                return (
                  <div
                    key={food._id}
                    className={`food-card ${selectedEntry?._id === food._id ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                    onClick={() => {
                      if (!isBooked) setSelectedEntry(food);
                    }}
                  >
                    <h3>{food.food_item}</h3>
                    <p className="meal-type">{food.meal_type}</p>
                    <p className="date">{format(new Date(food.date), 'MMMM d, yyyy')}</p>
                    <div className="weight-badge">{food.remaining_weight} kg</div>
                    {isBooked && <div className="booked-overlay">Booked</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking Form Section */}
        <div className="section">
          <h2>Make a Booking</h2>
          {selectedEntry ? (
            <form onSubmit={handleBooking} className="booking-form">
              <div className="selected-food">
                <h3>Selected Food: {selectedEntry.food_item}</h3>
                <p>Available Weight: {selectedEntry.remaining_weight} kg</p>
              </div>

              <div className="form-group">
                <label htmlFor="person_name">Person Name</label>
                <input
                  id="person_name"
                  type="text"
                  value={formData.person_name}
                  onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_number">Contact Number</label>
                <input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="trust_name">Trust Name</label>
                <input
                  id="trust_name"
                  type="text"
                  value={formData.trust_name}
                  onChange={(e) => setFormData({ ...formData, trust_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setSelectedEntry(null)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Processing...' : 'Book Now'}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-form-state">
              <p>Please select a food item from the available list to make a booking.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bookings List Section */}
      <div className="section bookings-list">
        <h2>Your Bookings</h2>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-details">
                  <h3>
                    {booking.food_entry_id?.food_item || 'Unknown Food Item'}
                  </h3>
                  <p><strong>Booked by:</strong> {booking.person_name}</p>
                  <p><strong>Contact:</strong> {booking.contact_number}</p>
                  <p><strong>Trust:</strong> {booking.trust_name}</p>
                  <p className="booking-date">
                    <strong>Booked on:</strong> {format(new Date(booking.booking_date || booking.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="booking-actions">
                  <button 
                    onClick={() => handleDeleteBooking(booking._id)} 
                    className="delete-button"
                    disabled={loading}
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
