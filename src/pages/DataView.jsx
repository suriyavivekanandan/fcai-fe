import React, { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, Search, Trash2 } from 'lucide-react';

function DataView() {
  const [entries, setEntries] = useState([
    { id: '1', date: '2025-03-01', meal_type: 'Lunch', food_item: 'Rice', initial_weight: 5, remaining_weight: 2 },
    { id: '2', date: '2025-03-02', meal_type: 'Dinner', food_item: 'Pasta', initial_weight: 4, remaining_weight: 1 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    setDeleteLoading(id);
    setTimeout(() => {
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      setDeleteLoading(null);
    }, 500);
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedEntries = [...entries]
    .filter((entry) =>
      entry.food_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.meal_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="relative w-full sm:w-auto mb-4">
        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['date', 'meal_type', 'food_item', 'initial_weight', 'remaining_weight'].map((field) => (
              <th
                key={field}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort(field)}
              >
                <div className="flex items-center">
                  {field.replace('_', ' ').toUpperCase()}
                  {sortField === field && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAndSortedEntries.length > 0 ? (
            filteredAndSortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{format(new Date(entry.date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4">{entry.meal_type}</td>
                <td className="px-6 py-4">{entry.food_item}</td>
                <td className="px-6 py-4">{entry.initial_weight} kg</td>
                <td className="px-6 py-4">{entry.remaining_weight} kg</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteLoading === entry.id}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    {deleteLoading === entry.id ? 'Deleting...' : <Trash2 className="h-5 w-5" />}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No entries available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataView;