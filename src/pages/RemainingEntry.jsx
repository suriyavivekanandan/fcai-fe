import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Scale, AlertCircle, RefreshCw } from 'lucide-react';

// Mock function to replace the ESP8266 integration
const mockFetchWeight = () => {
  return new Promise((resolve) => {
    // Simulate a delay
    setTimeout(() => {
      // Return a random weight between 0.1 and 2.0 kg
      resolve(Math.round((Math.random() * 1.9 + 0.1) * 100) / 100);
    }, 1000);
  });
};

// Sample mock data
const mockEntries = [
  {
    id: '1',
    food_item: 'Rice',
    date: '2025-03-05',
    meal_type: 'lunch',
    initial_weight: 0.75,
    remaining_weight: null
  },
  {
    id: '2',
    food_item: 'Chicken',
    date: '2025-03-05',
    meal_type: 'dinner',
    initial_weight: 1.25,
    remaining_weight: null
  },
  {
    id: '3',
    food_item: 'Salad',
    date: '2025-03-04',
    meal_type: 'lunch',
    initial_weight: 0.50,
    remaining_weight: null
  }
];

function RemainingEntry() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    // Simulate loading data from database
    setLoading(true);
    setTimeout(() => {
      setEntries(mockEntries);
      setLoading(false);
    }, 800);
  };

  const handleUpdateWeight = async (id, remainingWeight) => {
    setUpdating(id);
    try {
      // Simulate database update
      setTimeout(() => {
        setEntries(entries.map(entry => 
          entry.id === id 
            ? { ...entry, remaining_weight: remainingWeight } 
            : entry
        ));
        setUpdating(null);
      }, 800);
    } catch (error) {
      console.error('Error updating remaining weight:', error);
      alert('Error updating remaining weight. Please try again.');
      setUpdating(null);
    }
  };

  const handleFetchWeight = async (entryId) => {
    setIsFetching(true);
    setSelectedEntryId(entryId);
    try {
      const weight = await mockFetchWeight();
      await handleUpdateWeight(entryId, weight);
    } catch (error) {
      console.error('Error fetching weight:', error);
      alert('Failed to fetch weight from sensor. Please try again or enter manually.');
    } finally {
      setIsFetching(false);
      setSelectedEntryId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Pending Entries</h3>
        <p className="mt-1 text-sm text-gray-500">There are no food entries that need remaining weight updates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Scale className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Remaining Weight Entry</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{entry.food_item}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(entry.date), 'MMMM d, yyyy')} - {entry.meal_type}
                </p>
              </div>
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                {entry.initial_weight} kg
              </span>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Weight (kg)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={entry.initial_weight}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter remaining weight"
                  disabled={updating === entry.id || isFetching}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateWeight(entry.id, parseFloat(e.target.value));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFetchWeight(entry.id)}
                  disabled={isFetching && selectedEntryId === entry.id}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                >
                  <RefreshCw className={`h-5 w-5 ${isFetching && selectedEntryId === entry.id ? 'animate-spin' : ''}`} />
                  <span className="ml-1">Fetch</span>
                </button>
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling?.previousElementSibling;
                    handleUpdateWeight(entry.id, parseFloat(input.value));
                  }}
                  disabled={updating === entry.id || isFetching}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {updating === entry.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RemainingEntry;