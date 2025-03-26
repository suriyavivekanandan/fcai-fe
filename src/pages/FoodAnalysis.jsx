import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, PieChart as PieChartIcon, ArrowUpDown, Download, Calendar } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

// Utility functions
const getConsumptionCategory = (consumptionRate) => {
  if (consumptionRate >= 89) return { category: 'High Consumption', color: '#16a34a' };
  if (consumptionRate >= 75) return { category: 'Medium Consumption', color: '#eab308' };
  return { category: 'Low Consumption', color: '#dc2626' };
};

const getRecommendations = (foodItem, consumptionRate) => {
  if (consumptionRate >= 89) {
    return [
      `${foodItem} is being managed efficiently with ${consumptionRate.toFixed(1)}% consumption`,
      'Maintain current portion sizes',
      'Document successful practices',
      'Consider expanding menu with similar items'
    ];
  } else if (consumptionRate >= 75) {
    return [
      `${foodItem} shows moderate consumption at ${consumptionRate.toFixed(1)}%`,
      'Review portion sizes',
      'Monitor serving temperature',
      'Analyze peak consumption times'
    ];
  } else {
    return [
      `${foodItem} needs attention with ${consumptionRate.toFixed(1)}% consumption`,
      `Consider adjusting portion sizes`,
      'Review recipe and presentation',
      'Survey customer preferences'
    ];
  }
};

// Sub-components
const FoodItemCard = ({ item }) => {
  const { category, color } = getConsumptionCategory(item.consumption_rate);
  
  return (
    <div className="p-4 rounded-xl border border-green-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{item.food_item}</h3>
          <span 
            className="text-sm font-medium px-2 py-0.5 rounded-full inline-block mt-1" 
            style={{ 
              backgroundColor: `${color}20`, 
              color: color 
            }}
          >
            {category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Initial: {item.initial_weight.toFixed(1)} gm</p>
          <p className="text-sm text-gray-600">
            Remaining: {item.remaining_weight.toFixed(1)} gm
          </p>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Consumption Rate</span>
          <span className="font-bold" style={{ color }}>{item.consumption_rate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ 
              width: `${item.consumption_rate}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ item }) => {
  const { color } = getConsumptionCategory(item.consumption_rate);
  const recommendations = getRecommendations(item.food_item, item.consumption_rate);
  
  return (
    <div 
      className="p-5 rounded-xl border transition-all hover:shadow-md"
      style={{ 
        backgroundColor: `${color}10`, 
        borderColor: `${color}30` 
      }}
    >
      <h3 
        className="font-medium text-lg mb-3 flex items-center" 
        style={{ color }}
      >
        <span 
          className="w-2 h-2 rounded-full mr-2" 
          style={{ backgroundColor: color }}
        ></span>
        {item.food_item}
      </h3>
      <ul className="space-y-3">
        {recommendations.map((rec, idx) => (
          <li 
            key={idx} 
            className="flex items-start text-gray-700"
          >
            <span 
              className="mr-2 text-sm mt-1" 
              style={{ color }}
            >
              •
            </span>
            <span className="text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SummaryStats = ({ analysis }) => {
  const totalItems = analysis.length;
  const avgConsumptionRate = analysis.reduce((sum, item) => sum + item.consumption_rate, 0) / totalItems || 0;
  const highConsumptionItems = analysis.filter(item => item.consumption_rate >= 89).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <p className="text-sm text-gray-500">Average Consumption</p>
        <p className="text-2xl font-bold text-gray-800">{avgConsumptionRate.toFixed(1)}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <p className="text-sm text-gray-500">Total Items</p>
        <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <p className="text-sm text-gray-500">High Consumption Items</p>
        <p className="text-2xl font-bold text-gray-800">{highConsumptionItems}</p>
      </div>
    </div>
  );
};

function FoodAnalysis() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [allEntries, setAllEntries] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'consumption_rate',
    direction: 'desc'
  });

  // Fetch all data once
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://fcai-be.onrender.com/api/v1/food-entry');
        if (response.data && response.data.length > 0) {
          setAllEntries(response.data);
        } else {
          setAllEntries([]);
        }
      } catch (error) {
        console.error('Error fetching all data:', error);
        alert('Failed to load data. Please try again.');
        setAllEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter data by selected date whenever date changes or all entries update
  useEffect(() => {
    if (allEntries.length > 0) {
      const entriesForSelectedDate = allEntries.filter(entry => {
        const entryDate = entry.date.substring(0, 10);
        return entryDate === selectedDate && entry.remaining_weight !== null;
      });
      
      if (entriesForSelectedDate.length > 0) {
        const processedData = processEntries(entriesForSelectedDate);
        setAnalysis(processedData);
      } else {
        setAnalysis([]);
      }
    }
  }, [selectedDate, allEntries]);

  const processEntries = (entries) => {
    if (!entries || entries.length === 0) return [];
    
    const processedEntries = entries.map(entry => {
      const initialWeight = entry.initial_weight;
      const remainingWeight = entry.remaining_weight;
      const consumptionRate = initialWeight > 0 
        ? ((initialWeight - remainingWeight) / initialWeight) * 100 
        : 0;
      
      return {
        ...entry,
        consumption_rate: consumptionRate,
        waste_percentage: 100 - consumptionRate
      };
    });

    // Group entries by food item
    const groupedByFoodItem = processedEntries.reduce((acc, entry) => {
      if (!acc[entry.food_item]) {
        acc[entry.food_item] = [];
      }
      acc[entry.food_item].push(entry);
      return acc;
    }, {});

    // Aggregate entries by food item
    return Object.entries(groupedByFoodItem).map(([foodItem, entries]) => {
      const initialWeight = entries.reduce((sum, entry) => sum + entry.initial_weight, 0);
      const remainingWeight = entries.reduce((sum, entry) => sum + entry.remaining_weight, 0);
      const consumptionRate = initialWeight > 0 
        ? ((initialWeight - remainingWeight) / initialWeight) * 100 
        : 0;

      return {
        food_item: foodItem,
        initial_weight: initialWeight,
        remaining_weight: remainingWeight,
        consumption_rate: consumptionRate,
        waste_percentage: 100 - consumptionRate,
        frequency: entries.length
      };
    });
  };

  const sortedAnalysis = useMemo(() => {
    return [...analysis].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [analysis, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    if (analysis.length === 0) return;
    
    const headers = ['Food Item', 'Initial Weight (gm)', 'Remaining Weight (gm)', 'Consumption %', 'Waste %', 'Frequency'];
    const rows = analysis.map(item => [
      item.food_item,
      item.initial_weight.toString(),
      item.remaining_weight.toString(),
      item.consumption_rate.toFixed(1),
      item.waste_percentage.toFixed(1),
      item.frequency.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `food-consumption-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieChartData = useMemo(() => {
    return analysis.map(item => ({
      name: item.food_item,
      value: item.consumption_rate
    }));
  }, [analysis]);

  const COLORS = ['#16a34a', '#eab308', '#dc2626', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 min-h-screen py-8 min-w-max mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 ">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-white mr-3" />
                <h1 className="text-2xl font-bold text-white">Food Consumption Analysis</h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-white/10 rounded-lg p-2">
                  <Calendar className="h-4 w-4 text-white mr-2" />
                  <label htmlFor="date-select" className="text-white mr-2 text-sm font-medium">Date:</label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-white text-gray-800 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center bg-white/10 hover:bg-white/20 rounded-lg p-2 text-white text-sm transition-colors"
                  disabled={analysis.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {analysis.length > 0 ? <SummaryStats analysis={analysis} /> : (
              <div className="text-center text-gray-500 p-4 border rounded-lg">
                No food entries found for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
              </div>
            )}

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Daily Consumption Distribution</h2>
                </div>
                <div className="flex justify-center items-center h-[300px]">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500">No data available for selected date</div>
                  )}
                </div>
              </div>

              {/* Analysis Cards */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-lg font-semibold text-gray-800">Consumption Summary</h2>
                  <button 
                    onClick={() => handleSort('consumption_rate')}
                    className="flex items-center text-sm text-gray-600 hover:text-green-600"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sort by Consumption
                  </button>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                  {sortedAnalysis.length > 0 ? (
                    sortedAnalysis.map((item, index) => (
                      <FoodItemCard key={index} item={item} />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 p-4 border rounded-lg">
                      No food entries for selected date
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Action Recommendations</h2>
              {analysis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedAnalysis.map((item, index) => (
                    <RecommendationCard key={index} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No recommendations available. Select a date with food entries.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodAnalysis;