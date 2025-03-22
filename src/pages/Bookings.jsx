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
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <p className="text-lg text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
        <p className="mb-4 text-gray-700">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Food Waste Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Available Food Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Available Food</h2>
          {availableFood.length === 0 ? (
            <p className="text-gray-500">No food available for booking.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableFood.map(food => (
                <div
                  key={food._id}
                  className={`p-4 rounded shadow border cursor-pointer transition-all ${
                    selectedEntry?._id === food._id
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white hover:shadow-md'
                  }`}
                  onClick={() => setSelectedEntry(food)}
                >
                  <h3 className="text-lg font-medium">{food.food_item}</h3>
                  <p className="text-gray-600">Meal: {food.meal_type}</p>
                  <p className="text-gray-500 text-sm">Date: {format(new Date(food.date), 'MMMM d, yyyy')}</p>
                  <p className="text-green-600 font-medium">Remaining: {food.remaining_weight} kg</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Make a Booking</h2>
          {selectedEntry ? (
            <form onSubmit={handleBooking} className="space-y-4 bg-white p-4 rounded shadow border">
              <p className="font-medium">Selected: <span className="text-blue-600">{selectedEntry.food_item}</span></p>
              <div>
                <label className="block text-sm font-medium mb-1">Person Name:</label>
                <input
                  type="text"
                  value={formData.person_name}
                  onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number:</label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trust Name:</label>
                <input
                  type="text"
                  value={formData.trust_name}
                  onChange={(e) => setFormData({ ...formData, trust_name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:text-blue-500 hover:border-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {loading ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500">Select a food item to book.</p>
          )}
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white p-4 rounded shadow border space-y-2">
                <h3 className="text-lg font-semibold">
                  {booking.food_entry_id?.food_item || 'Unknown Food'}
                </h3>
                <p><span className="font-medium">By:</span> {booking.person_name}</p>
                <p><span className="font-medium">Contact:</span> {booking.contact_number}</p>
                <p><span className="font-medium">Trust:</span> {booking.trust_name}</p>
                <p className="text-sm text-gray-500">
                  Date: {format(new Date(booking.booking_date || booking.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
                <button
                  onClick={() => handleDeleteBooking(booking._id)}
                  disabled={loading}
                  className={`mt-2 px-3 py-1 text-sm text-white rounded ${
                    loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
