import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Database, ArrowUpDown, Search, Trash2, RefreshCw, Filter, Download } from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar";

function DataView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    mealType: "all",
    wasteLevel: "all"
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/v1/food-entry");
      if (!response.ok) throw new Error("Failed to fetch entries");

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
      alert("Error loading entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchEntries();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/food-entry/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete entry");

      await fetchEntries();
      alert("Entry deleted successfully");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSelectEntry = (id) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(selectedEntries.filter(entryId => entryId !== id));
    } else {
      setSelectedEntries([...selectedEntries, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === filteredAndSortedEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredAndSortedEntries.map(entry => entry._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedEntries.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedEntries.length} entries?`)) return;

    try {
      setLoading(true);
      
      for (const id of selectedEntries) {
        await fetch(`http://localhost:5000/api/v1/food-entry/${id}`, {
          method: "DELETE",
        });
      }
      
      await fetchEntries();
      setSelectedEntries([]);
      alert("Entries deleted successfully");
    } catch (error) {
      console.error("Error during bulk delete:", error);
      alert("Some entries could not be deleted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getWastePercentage = (entry) => {
    if (
      entry.initial_weight > 0 &&
      entry.remaining_weight !== null &&
      entry.remaining_weight >= 0
    ) {
      const waste = (entry.remaining_weight / entry.initial_weight) * 100;
      return waste.toFixed(1);
    }
    return "N/A";
  };

  const getWasteClass = (wastePercentage) => {
    if (wastePercentage === "N/A") return "bg-gray-100 text-gray-600";
    const value = parseFloat(wastePercentage);
    if (value > 50) return "bg-red-100 text-red-600";
    if (value > 25) return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const getWasteLevel = (wastePercentage) => {
    if (wastePercentage === "N/A") return "unknown";
    const value = parseFloat(wastePercentage);
    if (value > 50) return "high";
    if (value > 25) return "medium";
    return "low";
  };

  const exportToCsv = () => {
    const headers = ["Date", "Meal Type", "Food Item", "Initial Weight (gm)", "Remaining Weight", "Waste %"];
    const csvData = filteredAndSortedEntries.map(entry => {
      const wastePercentage = getWastePercentage(entry);
      return [
        format(new Date(entry.date), "yyyy-MM-dd"),
        entry.meal_type,
        entry.food_item,
        entry.initial_weight,
        entry.remaining_weight ?? "",
        wastePercentage
      ].join(',');
    });
    
    const csv = [headers.join(','), ...csvData].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `food-waste-data-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Apply filters
  let filteredEntries = entries;
  
  // Filter by meal type if active
  if (activeFilters.mealType !== "all") {
    filteredEntries = filteredEntries.filter(entry => 
      entry.meal_type.toLowerCase() === activeFilters.mealType.toLowerCase()
    );
  }
  
  // Filter by waste level if active
  if (activeFilters.wasteLevel !== "all") {
    filteredEntries = filteredEntries.filter(entry => {
      const wastePercentage = getWastePercentage(entry);
      return getWasteLevel(wastePercentage) === activeFilters.wasteLevel;
    });
  }
  
  // Get unique meal types for filter
  const mealTypes = ["all", ...new Set(entries.map(entry => entry.meal_type.toLowerCase()))];

  // Apply search term and sorting
  const filteredAndSortedEntries = filteredEntries
    .filter((entry) =>
      entry.food_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.meal_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="w-full p-4 pt-24 bg-gradient-to-b from-white to-green-50 flex-grow">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-7xl mx-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Food Waste Dashboard
                </h1>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                />
              </div>
            </div>
            
            {/* Filters and action buttons row */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <Filter className="text-green-500 w-4 h-4 mr-2" />
                  <select 
                    value={activeFilters.mealType}
                    onChange={(e) => setActiveFilters({...activeFilters, mealType: e.target.value})}
                    className="border border-green-300 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Meal Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <select 
                    value={activeFilters.wasteLevel}
                    onChange={(e) => setActiveFilters({...activeFilters, wasteLevel: e.target.value})}
                    className="border border-green-300 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Waste Levels</option>
                    <option value="low">Low Waste (&lt;25%)</option>
                    <option value="medium">Medium Waste (25-50%)</option>
                    <option value="high">High Waste (&gt;50%)</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={refreshData} 
                  disabled={refreshing}
                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                
                <button 
                  onClick={exportToCsv}
                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Export
                </button>
                
                {selectedEntries.length > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete ({selectedEntries.length})
                  </button>
                )}
              </div>
            </div>
            
            {/* Stats row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Total Entries</p>
                <p className="text-2xl font-bold text-green-600">{filteredAndSortedEntries.length}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Average Waste</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedEntries.length ? 
                    (filteredAndSortedEntries
                      .filter(entry => getWastePercentage(entry) !== "N/A")
                      .reduce((sum, entry) => sum + parseFloat(getWastePercentage(entry)), 0) / 
                      filteredAndSortedEntries.filter(entry => getWastePercentage(entry) !== "N/A").length || 0
                    ).toFixed(1) + "%" : 
                    "N/A"}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                <p className="text-sm text-gray-500 mb-1">High Waste Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedEntries.filter(entry => {
                    const waste = getWastePercentage(entry);
                    return waste !== "N/A" && parseFloat(waste) > 50;
                  }).length}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Total Food Weight</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedEntries
                    .reduce((sum, entry) => sum + entry.initial_weight, 0)
                    .toFixed(1)} gm
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full divide-y divide-green-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3">
                    <input 
                      type="checkbox"
                      checked={selectedEntries.length === filteredAndSortedEntries.length && filteredAndSortedEntries.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                    />
                  </th>
                  {["date", "meal_type", "food_item", "initial_weight", "remaining_weight"].map((field) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center">
                        {field.replace("_", " ").charAt(0).toUpperCase() + field.replace("_", " ").slice(1)}
                        {sortField === field && <ArrowUpDown className="ml-1 h-4 w-4" />}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
                    Waste %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-200">
                {filteredAndSortedEntries.length > 0 ? (
                  filteredAndSortedEntries.map((entry) => {
                    const wastePercentage = getWastePercentage(entry);

                    return (
                      <tr key={entry._id} className="hover:bg-green-50">
                        <td className="px-4 py-4">
                          <input 
                            type="checkbox"
                            checked={selectedEntries.includes(entry._id)}
                            onChange={() => handleSelectEntry(entry._id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {entry.meal_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{entry.food_item}</td>
                        <td className="px-6 py-4">{entry.initial_weight} gm</td>
                        <td className="px-6 py-4">
                          {entry.remaining_weight !== null ? `${entry.remaining_weight} gm` : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-sm font-medium rounded-full ${getWasteClass(wastePercentage)}`}>
                            {wastePercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(entry._id)}
                            disabled={deleteLoading === entry._id}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                          >
                            {deleteLoading === entry._id ? (
                              <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No entries available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination footer */}
          <div className="bg-green-50 px-6 py-3 flex items-center justify-between border-t border-green-200">
            <div className="flex-1 flex justify-between">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAndSortedEntries.length}</span> of <span className="font-medium">{entries.length}</span> entries
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataView;