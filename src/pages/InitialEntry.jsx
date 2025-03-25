import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import foodEntryService from "../service/foodEntryService";
import { fetchWeightFromESP, getMQTTClient } from "../Lib/esp8266";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="relative flex-grow pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background gradient similar to home page */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10" />
        
        <div className="max-w-4xl mx-auto p-6 my-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Initial <span className="text-green-600">Food Entry</span>
            </h1>
            <div className="flex items-center px-4 py-2 rounded-full bg-green-100 shadow-inner">
              {mqttConnected ? (
                <div className="flex items-center gap-2 text-green-700">
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
          
          <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-2xl">
            <div className={`h-2 ${mealType === 'breakfast' ? 'bg-amber-400' : mealType === 'lunch' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                    <select 
                      value={mealType} 
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Food Items</h3>
                    <div className="space-y-4">
                      {foodItems.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-green-100">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Food Item</label>
                            <select
                              value={item.food_item}
                              onChange={(e) => {
                                const newItems = [...foodItems];
                                newItems[index].food_item = e.target.value;
                                setFoodItems(newItems);
                              }}
                              className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white"
                            >
                              {FOOD_ITEMS.map(food => (
                                <option key={food} value={food}>{food}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full sm:w-32">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Weight (g)</label>
                            <input
                              type="number"
                              value={item.initial_weight}
                              onChange={(e) => {
                                const newItems = [...foodItems];
                                newItems[index].initial_weight = e.target.value;
                                setFoodItems(newItems);
                              }}
                              className="w-full border border-green-300 rounded-lg py-2 px-3 bg-white"
                            />
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0">
                            <Button 
                              onClick={() => handleFetchWeight(index)}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
                              disabled={!mqttConnected}
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Fetch</span>
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleRemoveDish(index)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm"
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
                    type="button" 
                    onClick={handleAddDish}
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Dish
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="animate-spin h-5 w-5 mr-2" /> : "Save Entry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InitialEntry;