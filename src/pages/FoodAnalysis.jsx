import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, PieChart as PieChartIcon, ArrowUpDown, Download, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

// Utility functions
const getConsumptionCategory = (wastePercentage) => {
  if (wastePercentage <= 11) return { category: 'High Consumption', color: '#22c55e' };
  if (wastePercentage <= 25) return { category: 'Medium Consumption', color: '#eab308' };
  return { category: 'Low Consumption', color: '#ef4444' };
};

const getRecommendations = (foodItem, wastePercentage) => {
  if (wastePercentage <= 11) {
    return [
      `${foodItem} is being managed efficiently with ${wastePercentage.toFixed(1)}% waste`,
      'Maintain current portion sizes',
      'Document successful practices',
      'Consider expanding menu with similar items'
    ];
  } else if (wastePercentage <= 25) {
    return [
      `${foodItem} shows moderate waste at ${wastePercentage.toFixed(1)}%`,
      'Review portion sizes',
      'Monitor serving temperature',
      'Analyze peak consumption times'
    ];
  } else {
    return [
      `${foodItem} needs attention with ${wastePercentage.toFixed(1)}% waste`,
      `Consider reducing preparation by ${Math.round(wastePercentage/2)}%`,
      'Review recipe and presentation',
      'Survey customer preferences'
    ];
  }
};

// Sample data for testing
const sampleData = [
  {
    food_item: "Pasta Primavera",
    initial_weight: 12.5,
    remaining_weight: 3.1,
    date: "2025-03-06"
  },
  {
    food_item: "Grilled Chicken",
    initial_weight: 15.2,
    remaining_weight: 1.2,
    date: "2025-03-06"
  },
  {
    food_item: "Caesar Salad",
    initial_weight: 8.7,
    remaining_weight: 2.8,
    date: "2025-03-06"
  },
  {
    food_item: "Tomato Soup",
    initial_weight: 10.0,
    remaining_weight: 3.5,
    date: "2025-03-06"
  },
  {
    food_item: "Chocolate Cake",
    initial_weight: 5.3,
    remaining_weight: 0.4,
    date: "2025-03-06"
  }
];

const previousDaySampleData = [
  {
    food_item: "Pasta Primavera",
    initial_weight: 12.0,
    remaining_weight: 3.5,
    date: "2025-03-05"
  },
  {
    food_item: "Grilled Chicken",
    initial_weight: 14.8,
    remaining_weight: 1.5,
    date: "2025-03-05"
  },
  {
    food_item: "Caesar Salad",
    initial_weight: 8.5,
    remaining_weight: 3.2,
    date: "2025-03-05"
  },
  {
    food_item: "Tomato Soup",
    initial_weight: 9.8,
    remaining_weight: 3.0,
    date: "2025-03-05"
  }
];

// Sub-components
const FoodItemCard = ({ item }) => {
  const { category, color } = getConsumptionCategory(item.waste_percentage);
  
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{item.food_item}</h3>
          <span className="text-sm font-medium px-2 py-0.5 rounded-full inline-block mt-1" 
            style={{ backgroundColor: `${color}20`, color }}>
            {category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Initial: {item.initial_weight} kg</p>
          <p className="text-sm text-gray-600">
            Remaining: {item.remaining_weight} kg
          </p>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Waste Percentage</span>
          <span className="font-bold" style={{ color }}>{item.waste_percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ 
              width: `${item.waste_percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ item }) => {
  const { color } = getConsumptionCategory(item.waste_percentage);
  const recommendations = getRecommendations(item.food_item, item.waste_percentage);
  
  return (
    <div 
      className="p-5 rounded-lg border transition-all hover:shadow-md"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
    >
      <h3 className="font-medium text-lg mb-3 flex items-center" style={{ color }}>
        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>
        {item.food_item}
      </h3>
      <ul className="space-y-3">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start text-gray-700">
            <span className="mr-2 text-sm mt-1" style={{ color }}>•</span>
            <span className="text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SummaryStats = ({ analysis }) => {
  // Calculate summary statistics
  const totalItems = analysis.length;
  const totalWaste = analysis.reduce((sum, item) => sum + item.waste_percentage, 0) / totalItems || 0;
  const highConsumptionItems = analysis.filter(item => item.waste_percentage <= 11).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <p className="text-sm text-gray-500">Average Waste</p>
        <p className="text-2xl font-bold text-gray-800">{totalWaste.toFixed(1)}%</p>
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

// Main component
function FoodAnalysis() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [previousData, setPreviousData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'waste_percentage',
    direction: 'desc'
  });

  // Fetch data on component mount and date change
  useEffect(() => {
    fetchAnalysis();
    fetchPreviousData();
  }, [selectedDate]);

  const fetchAnalysis = () => {
    // Simulate API call with timeout
    setTimeout(() => {
      // Filter sample data for the selected date
      const filteredData = sampleData.filter(item => item.date === selectedDate);
      const processedData = processEntries(filteredData);
      setAnalysis(processedData);
      setLoading(false);
    }, 1000);
  };

  const fetchPreviousData = () => {
    // Simulate API call for previous day data
    const previousDate = format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd');
    const filteredData = previousDaySampleData.filter(item => item.date === previousDate);
    const processedData = processEntries(filteredData);
    setPreviousData(processedData);
  };

  const processEntries = (entries) => {
    // Group by food item
    const groupedEntries = entries.reduce((acc, entry) => {
      if (!acc[entry.food_item]) {
        acc[entry.food_item] = {
          food_item: entry.food_item,
          entries: []
        };
      }
      acc[entry.food_item].entries.push(entry);
      return acc;
    }, {});

    // Calculate aggregated metrics
    return Object.values(groupedEntries).map(group => {
      const totalInitial = group.entries.reduce((sum, entry) => sum + entry.initial_weight, 0);
      const totalRemaining = group.entries.reduce((sum, entry) => sum + entry.remaining_weight, 0);
      const waste = (totalRemaining / totalInitial) * 100;
      
      return {
        food_item: group.food_item,
        initial_weight: totalInitial,
        remaining_weight: totalRemaining,
        waste_percentage: waste,
        consumption_rate: 100 - waste,
        frequency: group.entries.length,
        total_waste: totalRemaining
      };
    });
  };

  // Sort the analysis data
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
    
    const headers = ['Food Item', 'Initial Weight (kg)', 'Remaining Weight (kg)', 'Waste %', 'Consumption %'];
    const rows = analysis.map(item => [
      item.food_item,
      item.initial_weight.toString(),
      item.remaining_weight.toString(),
      item.waste_percentage.toFixed(1),
      item.consumption_rate.toFixed(1)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `food-waste-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data
  const pieChartData = useMemo(() => {
    return analysis.map(item => ({
      name: item.food_item,
      value: item.waste_percentage
    }));
  }, [analysis]);

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-white mr-3" />
                <h1 className="text-2xl font-bold text-white">Food Waste Analysis</h1>
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
                    className="px-3 py-1.5 bg-white text-gray-800 rounded-md focus:ring-2 focus:ring-white focus:outline-none"
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
            {analysis.length > 0 && <SummaryStats analysis={analysis} />}

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Daily Waste Distribution</h2>
                </div>
                <div className="flex justify-center items-center h-64">
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
                    onClick={() => handleSort('waste_percentage')}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sort by Waste
                  </button>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
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

            {/* Comparison with Previous Day */}
            {previousData.length > 0 && analysis.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Comparison with Previous Day</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Food Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Waste %
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Previous Waste %
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysis.map((item, index) => {
                        const prevItem = previousData.find(prev => prev.food_item === item.food_item);
                        const change = prevItem ? item.waste_percentage - prevItem.waste_percentage : null;
                        const changeColor = change === null ? 'text-gray-500' : change > 0 ? 'text-red-500' : 'text-green-500';
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.food_item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.waste_percentage.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {prevItem ? prevItem.waste_percentage.toFixed(1) + '%' : 'N/A'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${changeColor}`}>
                              {change !== null ? (
                                <>
                                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                </>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodAnalysis;