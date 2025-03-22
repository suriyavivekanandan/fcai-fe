import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Scale, AlertCircle, RefreshCw, Wifi, WifiOff, CheckCircle, Trash2 } from "lucide-react";
import axios from "axios";
import { fetchWeightFromESP, getMQTTClient } from "../Lib/esp8266"; 

const API_BASE_URL = "https://fcai-be-1.onrender.com/api/v1";

const RemainingEntry = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [fetchedWeights, setFetchedWeights] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(null);

  useEffect(() => {
    fetchEntries();
    
    // Check MQTT connection status
    const checkMqttConnection = () => {
      const client = getMQTTClient();
      setMqttConnected(client.isConnected());
    };
    
    // Check immediately and then every 3 seconds
    checkMqttConnection();
    const intervalId = setInterval(checkMqttConnection, 3000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching entries from API...");
      // Use the correct endpoint
      const response = await axios.get(`${API_BASE_URL}/food-entry`);
      console.log("API response:", response);
      
      if (!Array.isArray(response.data)) {
        console.error("API didn't return an array:", response.data);
        setError("API did not return an array of entries");
        setEntries([]);
        return;
      }
      
      const filteredEntries = response.data.filter(entry => entry.remaining_weight === null);
      console.log(`Found ${filteredEntries.length} entries with null remaining_weight out of ${response.data.length} total entries`);
      setEntries(filteredEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError(error.message || "Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeight = async (id, remainingWeight) => {
    if (!remainingWeight && remainingWeight !== 0) {
      alert("Please enter a valid remaining weight");
      return;
    }
    
    if (isNaN(parseFloat(remainingWeight))) {
      alert("Please enter a valid number for remaining weight");
      return;
    }
    
    setUpdating(id);
    try {
      console.log(`Updating entry ${id} with remaining weight: ${remainingWeight}`);
      // Use the correct endpoint
      const response = await axios.put(`${API_BASE_URL}/food-entry/${id}`, { 
        remaining_weight: parseFloat(remainingWeight) 
      });
      console.log("Update response:", response);
      
      // Clear this entry from fetchedWeights after successful update
      setFetchedWeights(prev => {
        const updated = {...prev};
        delete updated[id];
        return updated;
      });
      
      // Show success message
      setUpdateSuccess(id);
      setTimeout(() => setUpdateSuccess(null), 3000);
      
      await fetchEntries(); // Refresh the list after update
    } catch (error) {
      console.error("Error updating weight:", error);
      alert(`Error updating remaining weight: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteEntry = async (id) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }
    
    setDeleting(id);
    try {
      console.log(`Deleting entry ${id}`);
      await axios.delete(`${API_BASE_URL}/food-entry/${id}`);
      
      // Remove from state
      setEntries(entries.filter(entry => entry._id !== id));
      
      // Clear from fetchedWeights if present
      if (fetchedWeights[id]) {
        setFetchedWeights(prev => {
          const updated = {...prev};
          delete updated[id];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert(`Error deleting entry: ${error.message || "Unknown error"}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleFetchWeight = async (entryId) => {
    setIsFetching(true);
    setSelectedEntryId(entryId);
    
    try {
      let weight;
      
      // Try MQTT first if connected
      if (mqttConnected) {
        console.log("Fetching weight from MQTT sensor...");
        try {
          weight = await fetchWeightFromESP();
          console.log("Weight from MQTT:", weight);
        } catch (mqttError) {
          console.error("MQTT fetch failed:", mqttError);
          throw mqttError; // Let the outer catch handle this
        }
      } else {
        throw new Error("MQTT not connected");
      }
      
      // If we got a valid weight, update the input field
      if (weight !== null && typeof weight !== 'undefined') {
        setFetchedWeights(prev => ({
          ...prev,
          [entryId]: weight
        }));
      } else {
        throw new Error("Invalid weight data received from sensor");
      }
    } catch (error) {
      console.error("Error fetching weight:", error);
      
      // Fallback to API
      try {
        console.log("Falling back to API for weight data...");
        const response = await axios.get(`${API_BASE_URL}/food-entry/fetch-weight`);
        console.log("API sensor weight response:", response);
        
        if (response.data && typeof response.data.weight !== 'undefined') {
          setFetchedWeights(prev => ({
            ...prev,
            [entryId]: response.data.weight
          }));
        } else {
          throw new Error("Invalid weight data received from sensor API");
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        alert(`Failed to fetch weight: ${error.message}. API fallback also failed.`);
      }
    } finally {
      setIsFetching(false);
      setSelectedEntryId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <span className="mt-6 block text-xl font-medium text-gray-700">Loading entries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto text-center py-16 px-4 bg-white rounded-xl shadow-xl my-12">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Entries</h3>
        <p className="mt-2 text-md text-red-500">{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="w-full mx-auto text-center py-16 px-4 bg-white rounded-xl shadow-xl my-12">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">All Done!</h3>
        <p className="mt-2 text-md text-gray-600">There are no food entries that need remaining weight updates.</p>
        <button
          onClick={fetchEntries}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center mx-auto"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          <span>Refresh Entries</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 mt-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Scale className="h-10 w-10 text-white mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-white">Remaining Weight Entry</h1>
              <p className="text-blue-100 mt-1">Track your food consumption by measuring what's left</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 bg-white bg-opacity-20 rounded-lg px-4 py-2 flex items-center">
              {mqttConnected ? (
                <Wifi className="h-5 w-5 text-green-300 mr-2" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-300 mr-2" />
              )}
              <span className="text-white">
                {mqttConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
              </span>
            </div>
            <button
              onClick={fetchEntries}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors duration-300 shadow-md flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-medium text-blue-600">{entries.length}</span> entries requiring remaining weight
          </p>
          <p className="text-sm text-gray-500">Updated: {format(new Date(), "MMMM d, yyyy h:mm a")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <div 
            key={entry._id} 
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
              updating === entry._id ? "border-2 border-blue-500" : 
              updateSuccess === entry._id ? "border-2 border-green-500" : ""
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{entry.food_item}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(entry.date), "MMMM d, yyyy")}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                      {entry.meal_type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-2">
                  <span className="px-4 py-2 text-md font-medium text-blue-700 bg-blue-100 rounded-lg">
                    Initial: {entry.initial_weight} kg
                  </span>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    disabled={deleting === entry._id}
                    className={`p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-300 ${
                      deleting === entry._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Delete entry"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Weight (kg)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={entry.initial_weight}
                      value={fetchedWeights[entry._id] || ''}
                      onChange={(e) => setFetchedWeights({
                        ...fetchedWeights,
                        [entry._id]: e.target.value
                      })}
                      className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm py-3"
                      placeholder="Enter remaining weight"
                      disabled={updating === entry._id || isFetching || deleting === entry._id}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateWeight(entry._id, parseFloat(e.target.value));
                        }
                      }}
                    />
                    <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">kg</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFetchWeight(entry._id)}
                    disabled={isFetching || deleting === entry._id}
                    className={`px-4 py-3 text-white rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-300 ${
                      isFetching ? "bg-green-500 opacity-75" : 
                      deleting === entry._id ? "bg-green-400 opacity-50 cursor-not-allowed" : 
                      "bg-green-600 hover:bg-green-700"
                    }`}
                    title={mqttConnected ? "Fetch weight from sensor" : "MQTT disconnected, will use API fallback"}
                  >
                    <RefreshCw className={`h-5 w-5 ${isFetching && selectedEntryId === entry._id ? "animate-spin" : ""}`} />
                    <span className="ml-2">Fetch</span>
                  </button>
                  <button
                    onClick={() => {
                      if (fetchedWeights[entry._id]) {
                        handleUpdateWeight(entry._id, parseFloat(fetchedWeights[entry._id]));
                      }
                    }}
                    disabled={updating === entry._id || isFetching || !fetchedWeights[entry._id] || deleting === entry._id}
                    className={`px-5 py-3 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                      updating === entry._id ? "bg-blue-500 opacity-75" : 
                      deleting === entry._id ? "bg-blue-400 opacity-50 cursor-not-allowed" :
                      !fetchedWeights[entry._id] ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {updating === entry._id ? "Saving..." : "Save"}
                  </button>
                </div>
                
                {/* Success indicator */}
                {updateSuccess === entry._id && (
                  <div className="mt-3 flex items-center text-green-600 animate-pulse">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Weight updated successfully!</span>
                  </div>
                )}
                
                {/* Deleting indicator */}
                {deleting === entry._id && (
                  <div className="mt-3 flex items-center text-red-500 animate-pulse">
                    <span className="text-sm">Deleting entry...</span>
                  </div>
                )}
                
                {/* Progress indicator */}
                {fetchedWeights[entry._id] && entry.initial_weight && (
                  <div className="mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700">Consumption</span>
                      <span className="text-sm text-gray-700">
                        {Math.round(((entry.initial_weight - fetchedWeights[entry._id]) / entry.initial_weight) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.round(((entry.initial_weight - fetchedWeights[entry._id]) / entry.initial_weight) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemainingEntry;