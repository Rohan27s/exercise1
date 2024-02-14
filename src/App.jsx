import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './App.css';

const App = () => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const initialStartDate = firstDayOfMonth;
  const initialEndDate = today;
  const initialInvestmentValue = '';
  const initialGoldPrices = [];
  const initialPriceChart = null;
  const initialError = '';
  const initialIsButtonDisabled = true;
  const initialMaxReturns = null;

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [goldPrices, setGoldPrices] = useState(initialGoldPrices);
  const [priceChart, setPriceChart] = useState(initialPriceChart);
  const [error, setError] = useState(initialError);
  const [isButtonDisabled, setIsButtonDisabled] = useState(initialIsButtonDisabled);
  const [investmentValue, setInvestmentValue] = useState(initialInvestmentValue);
  const [maxReturns, setMaxReturns] = useState(initialMaxReturns);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const daysDifference = Math.floor((endDateObj - startDateObj) / (24 * 60 * 60 * 1000));

    if (
      startDate === '' ||
      endDate === '' ||
      startDate >= endDate ||
      startDate >= today ||
      endDate > today
    ) {
      setIsButtonDisabled(true);
    } else if (daysDifference > 365) {
      setIsButtonDisabled(true);
      setError('Date range must be at least 365 days.');
    } else {
      setIsButtonDisabled(false);
      setError('');
    }

    if (startDate === '' || endDate === '') {
      setError('Please select both start and end dates.');
    } else if (startDate >= endDate) {
      setError('Start date should be earlier than the end date.');
    } else if (startDate >= today) {
      setError('Start date should be today or earlier.');
    } else if (endDate > today) {
      setError('End date should not exceed today.');
    } else {
      setError('');
    }
  }, [startDate, endDate]);

  const updateGraph = () => {
    fetch(`https://api.nbp.pl/api/cenyzlota/${startDate}/${endDate}`)
      .then(response => response.json())
      .then(data => {
        setGoldPrices(data);
        updateChart(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const updateChart = (data) => {
    if (priceChart) {
      priceChart.destroy();
    }
  
    const ctx = document.getElementById('priceChart').getContext('2d');
  
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.data),
        datasets: [{
          label: 'Gold Prices',
          data: data.map(item => item.cena),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)', 
          borderWidth: 3,
          pointRadius:4,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)', 
          pointBorderColor: 'rgba(255, 215, 0, 1)',
          pointHoverRadius: 4, 
          pointHoverBorderColor: 'rgba(0, 0, 0, 1)', 
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'yyyy-mm-dd'
              }
            },
            position: 'bottom'
          },
          y: {
            type: 'linear',
            position: 'left'
          }
        },
        elements: {
          line: {
            tension: 0.3, 
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)', 
            titleColor: '#fff', 
            bodyColor: '#fff', 
            borderColor: 'rgba(255, 255, 255, 0.7)', 
          }
        }
      }
    });
  
    setPriceChart(newChart);
  };
  
  

  const computeMaxReturns = () => {
    if (goldPrices.length === 0) {
      setMaxReturns(null);
      return;
    }

    let maxReturn = 0;
    let buyDate = null;
    let sellDate = null;
    let value = investmentValue;
    for (let i = 0; i < goldPrices.length - 1; i++) {
      for (let j = i + 1; j < goldPrices.length; j++) {
        const returnAmount = (investmentValue / goldPrices[i].cena) * goldPrices[j].cena - investmentValue;

        if (returnAmount > maxReturn) {
          maxReturn = returnAmount;
          buyDate = goldPrices[i].data;
          sellDate = goldPrices[j].data;
        }
      }
    }

    setMaxReturns({
      value,
      maxReturn,
      buyDate,
      sellDate,
    });
  };

  const handleInvestmentSubmit = async () => {
    if (!investmentValue) {
      setError('Please enter the investment value.');
      return;
    }

    setError('');
    updateGraph();
    computeMaxReturns();
  };

  const handleReset = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setGoldPrices(initialGoldPrices);
    setPriceChart(initialPriceChart);
    setError(initialError);
    setIsButtonDisabled(initialIsButtonDisabled);
    setInvestmentValue(initialInvestmentValue);
    setMaxReturns(initialMaxReturns);
  };

  useEffect(() => {
    return () => {
      if (priceChart) {
        priceChart.destroy();
      }
    };
  }, [priceChart]);

  useEffect(() => {
    updateGraph();
  }, []);

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded shadow-lg min-h-screen h-full mob_main_container">
      <h1 className="text-3xl mb-4 text-center font-semibold">Gold Price Tracker</h1>

      <div className="flex mb-4 mt-4 items-center gap-4 w-1/2 m-auto justify-center mob-div">
        <div className="flex gap-2 items-center flex-row col-mob">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">Start Date:</label>
          <input type="date" id="startDate" className="form-input justify-center mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="flex gap-2 items-center flex-row col-mob">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">End Date:</label>
          <input type="date" id="endDate" className="form-input justify-center mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex mb-4 mt-4 items-center gap-4 w-[80%] m-auto justify-center col-mob">
        <div className="flex gap-2 items-center flex-row">
          <label htmlFor="investmentValue" className="block text-sm font-medium text-gray-600">Investment Value (USD):</label>
          <input type="number" id="investmentValue" className="form-input justify-center mt-1" value={investmentValue} onChange={(e) => setInvestmentValue(e.target.value)} />
        </div>
        <div className="flex gap-2 items-center flex-row wrap-mob">
          <button
            className={`bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={updateGraph}
            disabled={isButtonDisabled}
          >
            Update Graph
          </button>
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2`}
            onClick={handleInvestmentSubmit}
          >
            Calculate Returns
          </button>
          <button
            className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2`}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex mb-4 mt-4 items-center w-1/2 m-auto justify-center">
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="flex mb-4 mt-4 items-center w-1/2 m-auto justify-center">
        {maxReturns && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            <p className="font-semibold">Investment Result:</p>
            <p className="mb-2">Investment Value: {maxReturns.value} USD</p>
            <p className="mb-2">Maximum Return: {maxReturns.maxReturn.toFixed(2)} USD</p>
            <p className="mb-2">Suggested Buy Date: {maxReturns.buyDate}</p>
            <p>Suggested Sell Date: {maxReturns.sellDate}</p>
          </div>
        )}
      </div>

      <div className="flex mb-4 mt-4 items-center w-[95%] max-h-[65vh] m-auto justify-center canvas_mobile">
        <canvas id="priceChart" className="w-full m-auto min-h-[50vh] border border-gray-300 canvas_mobile"></canvas>
      </div>
    </div>
  );
};

export default App;
