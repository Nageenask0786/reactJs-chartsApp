import { Component } from "react";

import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Area,
  ComposedChart,
  AreaChart,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { Oval } from "react-loader-spinner";

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const width = "90%"; // Width of the chart container
const COLORS = ["violet", "indigo", "blue", "green", "yellow", "orange", "red"];// Colors for pie chart segments

class ChartApp extends Component {
  state = {
    chartData: [],
    chartType: "Line",
    timeframe: "Daily",
    apiStatus: apiStatusConstants.initial,
  }; // Initial state

  componentDidMount() {
    this.getChartData(); // Fetch data when the component mounts
  }

// Function to fetch chart data from API and appropriately update apiStatus
  getChartData = async () => {
    //Error handling with try-catch blocks
    try {
      this.setState({ apiStatus: apiStatusConstants.inProgress });
      const apiUrl = "https://chartdata.onrender.com";
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        this.setState({
          chartData: data, // Update state with fetched data
          apiStatus: apiStatusConstants.success,
        });
      } else {
        this.setState({ apiStatus: apiStatusConstants.failure });
      }
    } catch (e) {
      console.log(`Some Error Occured ${e.message}`);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  // Handle change of chart type
  onChangeOfChartType = (event) => {
    this.setState({ chartType: event.target.value });
  };
 
  // Handle change of timeframe
  onChangeOfTimeframe = (event) => {
    this.setState({ timeframe: event.target.value });
  };

  // Get weekly data
  getWeeklyData = () => {
    const { chartData } = this.state;
    const weeklyData = chartData.reduce((acc, curr, index) => {
      const weekIndex = Math.floor(index / 7);
      if (!acc[weekIndex]) {
        acc[weekIndex] = { time: `Week ${weekIndex + 1}`, value: curr.value };
      } else {
        acc[weekIndex].value += curr.value;
      }
      return acc;
    }, []);
    return weeklyData;
  };
 // Get monthly aggregated data
  getMonthlyData = () => {
    const { chartData } = this.state;
    const monthlyData = chartData.reduce((acc, curr) => {
      const monthYear = curr.time.substr(0, 7); // YYYY-MM format

      // Check if the month already exists in acc
      const existingMonthIndex = acc.findIndex(
        (item) => item.time === monthYear
      );

      if (existingMonthIndex !== -1) {
        // If month exists, update its value
        acc[existingMonthIndex].value += curr.value;
      } else {
        // Otherwise, add new month object to acc
        acc.push({ time: monthYear, value: curr.value });
      }

      return acc;
    }, []);
    return monthlyData;
  };

    // Filter chart data based on selected timeframe
  getFilteredChartData = () => {
    const { timeframe, chartData } = this.state;
    console.log(timeframe);
    switch (timeframe) {
      case "Daily":
        return chartData;

      case "Monthly":
        return this.getMonthlyData();

      case "Weekly":
        return this.getWeeklyData();

      default:
        return chartData;
    }
  };
  
    // Render line chart
  renderLineChart = () => {
    const data = this.getFilteredChartData();
    console.log(data);
    return (
      <ResponsiveContainer width={width} height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#8884d8", fontFamily: "Nunito" }}
            axisLine={{ stroke: "#8884d8" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#8884d8", fontFamily: "Nunito" }}
            axisLine={{ stroke: "#8884d8" }}
          />
          <Tooltip wrapperStyle={{ fontFamily: "Nunito" }} />
          <Legend wrapperStyle={{ fontFamily: "Nunito" }} />
          <Line type="monotone" dataKey="value" stroke="green" />
        </LineChart>
      </ResponsiveContainer>
    );
  };
 
    // Render bar chart
  renderBarChart = () => {
    const data = this.getFilteredChartData();
    return (
      <ResponsiveContainer width={width} height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#8884d8", fontFamily: "Nunito" }}
            axisLine={{ stroke: "#8884d8" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#8884d8", fontFamily: "Nunito" }}
            axisLine={{ stroke: "#8884d8" }}
          />

          <Tooltip wrapperStyle={{ fontFamily: "Nunito" }} />
          <Legend wrapperStyle={{ fontFamily: "Nunito" }} />
          <Bar dataKey="value" fill="green" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  //Render area chart
  renderAreaChart = () => {
    const data = this.getFilteredChartData();
    return (
      <ResponsiveContainer width={width} height={350}>
        <AreaChart data={data} width={500} height={350}>
          <CartesianGrid strokeDasharray="3 3" />
          <defs>
            <linearGradient id="valueColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="50%" stopColor="#99bbff" />
              <stop offset="80%" stopColor="#ffec99" />
              <stop offset="100%" stopColor="#ff9999" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "green", fontFamily: "Nunito" }}
          />
          <YAxis tick={{ fontSize: 12, fill: "green", fontFamily: "Nunito" }} />

          <Tooltip wrapperStyle={{ fontFamily: "Nunito" }} />
          <Legend wrapperStyle={{ fontFamily: "Nunito" }} />
          <Area dataKey="value" fill="url(#valueColor)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // render pie chart
  renderPieChart = () => {
    const data = this.getFilteredChartData();

    return (
      <ResponsiveContainer width={width} height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="time"
            cx="50%"
            cy="50%"
            fill="#8884d8"
          >
            {data &&
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ fontFamily: "Nunito", fontSize: 14 }}
            formatter={(value, name, props) => [
              `Value: ${value}`,
              `Time: ${props.payload.time}`,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // render composed chart (area, bar, and line in one chart)

  renderComposedChart = () => {
    const data = this.getFilteredChartData();
    console.log(data);
    return (
      <ResponsiveContainer width={width} height={350}>
        <ComposedChart data={data}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#8884d8", fontFamily: "Nunito" }}
          />
          <YAxis
            tick={{ fontSize: 14, fill: "#8884d8", fontFamily: "Nunito" }}
          />
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip wrapperStyle={{ fontFamily: "Nunito" }} />
          <Legend wrapperStyle={{ fontFamily: "Nunito" }} />
          <Area
            type="monotone"
            dataKey="value"
            fill="#1ad1ff"
            stroke="#8884d8"
          />
          <Bar dataKey="value" fill="#40ff00" />
          <Line type="monotone" dataKey="value" stroke="red" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
 
  // Render the chart based on selected chart type
  renderChart = () => {
    const { chartType } = this.state;
    switch (chartType) {
      case "Line":
        return this.renderLineChart();
      case "Bar":
        return this.renderBarChart();
      case "Area":
        return this.renderAreaChart();
      case "Composed":
        return this.renderComposedChart();
      case "Pie":
        return this.renderPieChart();
      default:
        return "";
    }
  };

  // Render Loadingview when apiStatus is in progress
  renderLoadingView = () => (
    <Oval
      visible={true}
      height="40"
      width="40"
      color="#4fa94d"
      ariaLabel="oval-loading"
      wrapperClass="chart-app"
    />
  );

  // Render the chart on click of retry button
  onRetry = () => {
    this.getChartData();
  };

    // Render Failure view when apiStatus is failure
  renderFailureView = () => (
    <div className="chart-app">
      <h2>Some Error Occurred</h2>
      <button type="button" onClick={this.onRetry} className="retry-button">
        Retry
      </button>
    </div>
  );

    // Render Final app view based on status of api

  renderFinalAppView = () => {
    const { apiStatus } = this.state;
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderChart();
      case apiStatusConstants.failure:
        return this.renderFailureView();
      case apiStatusConstants.inProgress:
        return this.renderLoadingView();
      default:
        return null;
    }
  };

  // Render the entire component
  render() {
    const { chartType, timeframe } = this.state;
    return (
      <div className="charts-app-container">
        <div className="filters-container">
          <div className="select-container">
            <label htmlFor="chart-type">Chart Type</label>
            <select
              id="chart-type"
              value={chartType}
              onChange={this.onChangeOfChartType}
            >
              <option name="line" value="Line" id="line">
                Line
              </option>
              <option name="bar" value="Bar" id="bar">
                Bar
              </option>
              <option name="area" value="Area" id="area">
                Area
              </option>
              <option name="composed" value="Composed" id="composed">
                Composed
              </option>
              <option name="pie" value="Pie" id="pie">
                Pie
              </option>
            </select>
          </div>
          <div className="select-container">
            <label htmlFor="timeframe">Timeframe</label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={this.onChangeOfTimeframe}
            >
              <option id="daily" value="Daily" name="daily">
                Daily
              </option>
              <option id="weekly" name="weekly" value="Weekly">
                Weekly
              </option>
              <option id="monthly" name="monthly" value="Monthly">
                Monthly
              </option>
            </select>
          </div>
        </div>
        <div className="chart-app">{this.renderFinalAppView()}</div>
      </div>
    );
  }
}

export default ChartApp;
