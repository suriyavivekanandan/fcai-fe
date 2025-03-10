import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Scale, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import axios from "axios";
import { fetchWeightFromESP, getMQTTClient } from "../Lib/esp8266"; // Import MQTT functions

const API_BASE_URL = "http://localhost:5000/api/v1";

const RemainingEntry = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [fetchedWeights, setFetchedWeights] = useState({});

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
      
      await fetchEntries(); // Refresh the list after update
    } catch (error) {
      console.error("Error updating weight:", error);
      alert(`Error updating remaining weight: ${error.message || "Unknown error"}`);
    } finally {
      setUpdating(null);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading entries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Entries</h3>
        <p className="mt-1 text-sm text-red-500">{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Pending Entries</h3>
        <p className="mt-1 text-sm text-gray-500">There are no food entries that need remaining weight updates.</p>
        <button
          onClick={fetchEntries}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Scale className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Remaining Weight Entry</h1>
          
          {/* MQTT connection status indicator */}
          <div className="ml-4 flex items-center">
            {mqttConnected ? (
              <Wifi className="h-5 w-5 text-green-500 mr-1" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${mqttConnected ? 'text-green-500' : 'text-red-500'}`}>
              MQTT {mqttConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <button
          onClick={fetchEntries}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Found {entries.length} entries requiring remaining weight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{entry.food_item}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(entry.date), "MMMM d, yyyy")} - {entry.meal_type}
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
                  value={fetchedWeights[entry._id] || ''}
                  onChange={(e) => setFetchedWeights({
                    ...fetchedWeights,
                    [entry._id]: e.target.value
                  })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter remaining weight"
                  disabled={updating === entry._id || isFetching}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateWeight(entry._id, parseFloat(e.target.value));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFetchWeight(entry._id)}
                  disabled={isFetching}
                  className={`px-3 py-2 text-white rounded-md flex items-center ${
                    isFetching ? "bg-green-500 opacity-75" : "bg-green-600 hover:bg-green-700"
                  }`}
                  title={mqttConnected ? "Fetch weight from sensor" : "MQTT disconnected, will use API fallback"}
                >
                  <RefreshCw className={`h-5 w-5 ${isFetching && selectedEntryId === entry._id ? "animate-spin" : ""}`} />
                  <span className="ml-1">Fetch</span>
                </button>
                <button
                  onClick={() => {
                    if (fetchedWeights[entry._id]) {
                      handleUpdateWeight(entry._id, parseFloat(fetchedWeights[entry._id]));
                    }
                  }}
                  disabled={updating === entry._id || isFetching || !fetchedWeights[entry._id]}
                  className={`px-4 py-2 text-white font-medium rounded-md ${
                    updating === entry._id ? "bg-blue-500 opacity-75" : 
                    !fetchedWeights[entry._id] ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {updating === entry._id ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemainingEntry;