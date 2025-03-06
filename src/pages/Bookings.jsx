import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react';

function Bookings() {
  const [availableFood, setAvailableFood] = useState([
    { id: 1, food_item: 'Rice', remaining_weight: 5, date: new Date(), meal_type: 'Lunch' },
    { id: 2, food_item: 'Dal', remaining_weight: 3, date: new Date(), meal_type: 'Dinner' },
  ]);

  const [bookings, setBookings] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    person_name: '',
    contact_number: '',
    trust_name: '',
  });

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedEntry) return;

    const newBooking = {
      id: bookings.length + 1,
      food_entry: selectedEntry,
      trust_name: formData.trust_name,
      booking_date: new Date(),
    };

    setBookings([...bookings, newBooking]);
    setSelectedEntry(null);
    setFormData({ person_name: '', contact_number: '', trust_name: '' });
    alert('Booking created successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Calendar className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Food Bookings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Food Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Food</h2>
          {availableFood.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No food available for booking at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {availableFood.map((entry) => (
                <div
                  key={entry.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-colors ${
                    selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{entry.food_item}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.date), 'MMMM d, yyyy')} - {entry.meal_type}
                  </p>
                  <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
                    {entry.remaining_weight} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Booking</h2>
          {selectedEntry ? (
            <form onSubmit={handleBooking} className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Person Name"
                  required
                  value={formData.person_name}
                  onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  required
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Trust Name"
                  required
                  value={formData.trust_name}
                  onChange={(e) => setFormData({ ...formData, trust_name: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  Create Booking
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Select an available food item to create a booking.</p>
            </div>
          )}

          {/* Bookings List */}
          <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Recent Bookings</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Food Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trust</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.food_entry.food_item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.trust_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(booking.booking_date), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bookings;