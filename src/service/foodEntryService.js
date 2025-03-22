import axios from "axios";

const API = axios.create({
  baseURL: "https://fcai-be-1.onrender.com/api/v1/food-entry", // Backend URL
  headers: { "Content-Type": "application/json" },
});

const foodEntryService = {
  // Fetch all food entries
  getAllEntries: async () => {
    try {
      const response = await API.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching food entries:", error?.response?.data || error.message);
      throw error;
    }
  },

  // Add a new food entry
  addEntry: async (entryData) => {
    try {
      const response = await API.post("/", entryData);
      return response.data;
    } catch (error) {
      console.error("Error adding food entry:", error?.response?.data || error.message);
      throw error;
    }
  },

  // Update a food entry by ID
  updateEntry: async (id, updatedData) => {
    try {
      const response = await API.put(`/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating food entry:", error?.response?.data || error.message);
      throw error;
    }
  },

  // Delete a food entry by ID
  deleteEntry: async (id) => {
    try {
      const response = await API.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting food entry:", error?.response?.data || error.message);
      throw error;
    }
  },
};

export default foodEntryService;
