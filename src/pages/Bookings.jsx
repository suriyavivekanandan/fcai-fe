import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Trash2, RefreshCw } from 'lucide-react';
import bookingService from '../service/bookingService';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="relative flex-grow pt-24 pb-16 md:pt-32 md:pb-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10" />
          <p className="text-lg text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="relative flex-grow pt-24 pb-16 md:pt-32 md:pb-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10" />
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="mb-4 text-gray-700">{error}</p>
            <Button 
              onClick={fetchData} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="relative flex-grow pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10" />
        
        <div className="max-w-4xl mx-auto p-6 my-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Food <span className="text-green-600">Waste Booking</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Available Food Section */}
            <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
              <div className="h-2 bg-green-400"></div>
              <CardContent className="p-8">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Available Food</h2>
                {availableFood.length === 0 ? (
                  <p className="text-gray-500">No food available for booking.</p>
                ) : (
                  <div className="space-y-4">
                    {availableFood.map(food => (
                      <div
                        key={food._id}
                        className={`p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${
                          selectedEntry?._id === food._id
                            ? 'bg-green-100 border-green-500'
                            : 'bg-white hover:shadow-md border-green-100'
                        }`}
                        onClick={() => setSelectedEntry(food)}
                      >
                        <h3 className="text-lg font-medium text-gray-900">{food.food_item}</h3>
                        <p className="text-gray-600">Meal: {food.meal_type}</p>
                        <p className="text-gray-500 text-sm">Date: {format(new Date(food.date), 'MMMM d, yyyy')}</p>
                        <p className="text-green-600 font-medium">Remaining: {food.remaining_weight} gm</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Form Section */}
            <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
              <div className="h-2 bg-green-400"></div>
              <CardContent className="p-8">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Make a Booking</h2>
                {selectedEntry ? (
                  <form onSubmit={handleBooking} className="space-y-6">
                    <p className="font-medium">Selected: <span className="text-green-600">{selectedEntry.food_item}</span></p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
                        <input
                          type="text"
                          value={formData.person_name}
                          onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                          required
                          className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                          type="tel"
                          value={formData.contact_number}
                          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                          required
                          className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trust Name</label>
                        <input
                          type="text"
                          value={formData.trust_name}
                          onChange={(e) => setFormData({ ...formData, trust_name: e.target.value })}
                          required
                          className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between gap-4 pt-4">
                      <Button 
                        type="button" 
                        onClick={() => setSelectedEntry(null)}
                        className="bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={loading}
                      >
                        {loading ? <RefreshCw className="animate-spin h-5 w-5 mr-2" /> : "Book Now"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-500">Select a food item to book.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bookings Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Current <span className="text-green-600">Bookings</span>
            </h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map(booking => (
                  <Card key={booking._id} className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
                    <div className="h-1 bg-green-400"></div>
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.food_entry_id?.food_item || 'Unknown Food'}
                      </h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium text-gray-600">By:</span> {booking.person_name}</p>
                        <p><span className="font-medium text-gray-600">Contact:</span> {booking.contact_number}</p>
                        <p><span className="font-medium text-gray-600">Trust:</span> {booking.trust_name}</p>
                        <p className="text-gray-500">
                          Date: {format(new Date(booking.booking_date || booking.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteBooking(booking._id)}
                        disabled={loading}
                        className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Cancel Booking
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookings;