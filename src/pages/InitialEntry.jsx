import React, { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import foodEntryService from "../service/foodEntryService"; // Import API service

const FOOD_ITEMS = [
  "Rice", "Pasta", "Chicken", "Beef", "Fish",
  "Salad", "Vegetables", "Fruit", "Bread", "Soup"
];

const InitialEntry = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mealType, setMealType] = useState("breakfast");
  const [foodItems, setFoodItems] = useState([{ food_item: FOOD_ITEMS[0], initial_weight: "" }]);
  const [loading, setLoading] = useState(false);

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
      <h1 className="text-2xl font-bold mb-4">Initial Weight Entry</h1>
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

            <input
              type="number"
              value={entry.initial_weight}
              onChange={(e) => handleEntryChange(index, "initial_weight", e.target.value)}
              placeholder="Weight (kg)"
              required
              className="p-2 border rounded-md"
            />

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
