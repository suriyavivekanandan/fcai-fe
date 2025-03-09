import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import foodEntryService from "../service/foodEntryService";
import { fetchWeightFromESP, getMQTTClient } from "../Lib/esp8266"; // Import MQTT functions
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";
const FOOD_ITEMS = [
  "Rice", "Pasta", "Chicken", "Beef", "Fish",
  "Salad", "Vegetables", "Fruit", "Bread", "Soup"
];

const InitialEntry = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mealType, setMealType] = useState("breakfast");
  const [foodItems, setFoodItems] = useState([{ food_item: FOOD_ITEMS[0], initial_weight: "" }]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
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

  // Add a new dish
  const handleAddDish = () => {
    setFoodItems([...foodItems, { food_item: FOOD_ITEMS[0], initial_weight: "" }]);
  };

  // Remove a dish from the list
  const handleRemoveDish = (index) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  // Update input fields
  const handleEntryChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFoodItems(updatedItems);
  };

  // Fetch weight from sensor (similar to RemainingEntry)
  const handleFetchWeight = async (index) => {
    setIsFetching(true);
    setSelectedItemIndex(index);
    
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
        const updatedItems = [...foodItems];
        updatedItems[index] = { ...updatedItems[index], initial_weight: weight };
        setFoodItems(updatedItems);
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
          const updatedItems = [...foodItems];
          updatedItems[index] = { ...updatedItems[index], initial_weight: response.data.weight };
          setFoodItems(updatedItems);
        } else {
          throw new Error("Invalid weight data received from sensor API");
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        alert(`Failed to fetch weight: ${error.message}. API fallback also failed.`);
      }
    } finally {
      setIsFetching(false);
      setSelectedItemIndex(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payloads = foodItems.map(item => ({
        date,
        meal_type: mealType,
        food_item: item.food_item, 
        initial_weight: parseFloat(item.initial_weight) || 0, // Ensure valid number
      }));

      // Send each food item separately to match backend expectations
      await Promise.all(payloads.map(entry => foodEntryService.addEntry(entry)));

      alert("Food entry saved successfully!");
      setFoodItems([{ food_item: FOOD_ITEMS[0], initial_weight: "" }]); // Reset form
    } catch (error) {
      alert("Error saving food entry: " + (error?.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Initial Weight Entry</h1>
        
        {/* MQTT connection status indicator */}
        <div className="flex items-center">
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
      
      <form onSubmit={handleSubmit}>
        {/* Date Input */}
        <div className="mb-4">
          <label className="block font-medium">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Meal Type Selection */}
        <div className="mb-4">
          <label className="block font-medium">Meal Type:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Food Items List */}
        {foodItems.map((entry, index) => (
          <div key={index} className="mb-4 flex items-center gap-2">
            <select
              value={entry.food_item}
              onChange={(e) => handleEntryChange(index, "food_item", e.target.value)}
              className="p-2 border rounded-md"
            >
              {FOOD_ITEMS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <div className="flex flex-1 gap-2">
              <input
                type="number"
                value={entry.initial_weight}
                onChange={(e) => handleEntryChange(index, "initial_weight", e.target.value)}
                placeholder="Weight (kg)"
                required
                className="p-2 border rounded-md flex-1"
                disabled={isFetching && selectedItemIndex === index}
              />
              
              {/* Weight Fetch Button */}
              <button
                type="button"
                onClick={() => handleFetchWeight(index)}
                disabled={isFetching}
                className={`px-3 py-2 text-white rounded-md flex items-center ${
                  isFetching ? "bg-green-500 opacity-75" : "bg-green-600 hover:bg-green-700"
                }`}
                title={mqttConnected ? "Fetch weight from sensor" : "MQTT disconnected, will use API fallback"}
              >
                <RefreshCw className={`h-5 w-5 ${isFetching && selectedItemIndex === index ? "animate-spin" : ""}`} />
                <span className="ml-1">Fetch</span>
              </button>
            </div>

            {foodItems.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveDish(index)}
                className="p-2 bg-red-500 text-white rounded-md"
              >
                <Trash2 />
              </button>
            )}
          </div>
        ))}

        {/* Add Another Dish Button */}
        <button
          type="button"
          onClick={handleAddDish}
          className="p-2 bg-green-500 text-white rounded-md flex items-center gap-1"
        >
          <Plus /> Add Another Dish
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 p-2 bg-blue-500 text-white rounded-md w-full"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </div>
  );
};

export default InitialEntry;