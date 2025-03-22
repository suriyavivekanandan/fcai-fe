import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import foodEntryService from "../service/foodEntryService";
import { fetchWeightFromESP, getMQTTClient } from "../Lib/esp8266";
import axios from "axios";
import Button from "../components/ui/button-ie";
import Input from "../components/ui/input"; // ✅ Works fine now

import { Card, CardContent } from "../components/ui/card"; // ✅ fixed import



const API_BASE_URL = "https://fcai-be-1.onrender.com/api/v1";
const FOOD_ITEMS = [
  "Rice", "Pasta", "Chicken", "Beef", "Fish",
  "Salad", "Vegetables", "Fruit", "Bread", "Soup"
];

const InitialEntry = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mealType, setMealType] = useState("breakfast");
  const [foodItems, setFoodItems] = useState([{ food_item: FOOD_ITEMS[0], initial_weight: "" }]);
  const [loading, setLoading] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
    const checkMqttConnection = () => {
      const client = getMQTTClient();
      setMqttConnected(client.isConnected());
    };

    checkMqttConnection();
    const intervalId = setInterval(checkMqttConnection, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddDish = () => {
    setFoodItems([...foodItems, { food_item: FOOD_ITEMS[0], initial_weight: "" }]);
  };

  const handleRemoveDish = (index) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleFetchWeight = async (index) => {
    try {
      const weight = await fetchWeightFromESP();
      const updatedItems = [...foodItems];
      updatedItems[index] = { ...updatedItems[index], initial_weight: weight };
      setFoodItems(updatedItems);
    } catch (error) {
      alert("Failed to fetch weight");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payloads = foodItems.map(item => ({
        date,
        meal_type: mealType,
        food_item: item.food_item,
        initial_weight: parseFloat(item.initial_weight) || 0,
      }));
      await Promise.all(payloads.map(entry => foodEntryService.addEntry(entry)));
      alert("Food entry saved successfully!");
    } catch (error) {
      alert("Failed to save food entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-20 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Initial Food Entry</h1>
        <div className="flex items-center px-4 py-2 rounded-full bg-gray-100 shadow-inner">
          {mqttConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={18} className="animate-pulse" />
              <span className="text-sm font-medium">Scale Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff size={18} />
              <span className="text-sm font-medium">Scale Disconnected</span>
            </div>
          )}
        </div>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-2xl bg-white backdrop-blur-sm rounded-2xl">
        <div className={`h-2 ${mealType === 'breakfast' ? 'bg-amber-400' : mealType === 'lunch' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                <select 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Food Items</h3>
                <div className="space-y-4">
                  {foodItems.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Food Item</label>
                        <select
                          value={item.food_item}
                          onChange={(e) => {
                            const newItems = [...foodItems];
                            newItems[index].food_item = e.target.value;
                            setFoodItems(newItems);
                          }}
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          {FOOD_ITEMS.map(food => (
                            <option key={food} value={food}>{food}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Weight (g)</label>
                        <Input
                          type="number"
                          value={item.initial_weight}
                          onChange={(e) => {
                            const newItems = [...foodItems];
                            newItems[index].initial_weight = e.target.value;
                            setFoodItems(newItems);
                          }}
                          className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${item.initial_weight ? 'bg-green-50 border-green-200' : ''}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0">
                        <Button 
                          onClick={() => handleFetchWeight(index)}
                          className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                          disabled={!mqttConnected}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Fetch</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRemoveDish(index)}
                          className="bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between">
              <Button 
                onClick={handleAddDish}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 justify-center transition-all duration-200 border border-gray-300"
                type="button"
              >
                <Plus className="h-4 w-4" /> 
                <span>Add Dish</span>
              </Button>
              
              <Button 
                type="submit" 
                loading={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-lg shadow-md flex items-center gap-2 justify-center font-medium transition-all duration-200"
              >
                {loading ? (
                  <RefreshCw className="animate-spin h-5 w-5" />
                ) : "Save Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialEntry;