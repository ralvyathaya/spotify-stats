import React, { useState, useEffect } from 'react';
import { FaSpotify, FaClock } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function RecentlyPlayed({ accessToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/recently-played?time_range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch recently played tracks');

        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching recently played:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyPlayed();
  }, [accessToken, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-gray-700 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading recently played tracks: {error}
      </div>
    );
  }

  if (!data || !data.tracks.length) {
    return (
      <div className="text-gray-400 text-center">
        No recently played tracks found
      </div>
    );
  }

  // Prepare chart data and stats based on local time
  const getChartDataAndStats = () => {
    if (!data || !data.tracks) return { chartData: { labels: [], datasets: [] }, stats: {} };

    let labels = [];
    let counts = [];
    let totalTracks = data.tracks.length;
    let uniqueTracks = new Set(data.tracks.map(track => track.id)).size;
    let peakValue;

    const now = new Date();
    const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);

    switch (timeRange) {
      case '24h':
        const earliestStart = new Date(currentHourStart.getTime() - 24 * 60 * 60 * 1000);
        counts = Array(24).fill(0);
        labels = Array(24).fill('').map((_, i) => {
          const slotStart = new Date(earliestStart.getTime() + i * 3600 * 1000);
          return slotStart.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
        });

        data.tracks.forEach(track => {
          const trackDate = new Date(track.played_at);
          if (trackDate >= earliestStart && trackDate < currentHourStart) {
            const hoursFromStart = Math.floor((trackDate.getTime() - earliestStart.getTime()) / (3600 * 1000));
            if (hoursFromStart >= 0 && hoursFromStart < 24) {
              counts[hoursFromStart] += 1;
            }
          }
        });
        peakValue = Math.max(...counts);
        break;

      case '7d':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const earliestDay = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        counts = Array(7).fill(0);
        labels = Array(7).fill('').map((_, i) => {
          const day = new Date(earliestDay.getTime() + i * 86400 * 1000);
          return day.toLocaleDateString('en-US', { weekday: 'short' });
        });

        data.tracks.forEach(track => {
          const trackDate = new Date(track.played_at);
          const localDate = new Date(trackDate.getFullYear(), trackDate.getMonth(), trackDate.getDate());
          const daysFromStart = Math.floor((localDate - earliestDay) / (86400 * 1000));
          if (daysFromStart >= 0 && daysFromStart < 7) {
            counts[daysFromStart] += 1;
          }
        });
        peakValue = Math.max(...counts);
        break;

      case '30d':
        const today30 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const earliestDay30 = new Date(today30.getTime() - 29 * 24 * 60 * 60 * 1000);
        counts = Array(30).fill(0);
        labels = Array(30).fill('').map((_, i) => {
          const day = new Date(earliestDay30.getTime() + i * 86400 * 1000);
          return day.toLocaleDateString('en-US', { day: 'numeric' });
        });

        data.tracks.forEach(track => {
          const trackDate = new Date(track.played_at);
          const localDate = new Date(trackDate.getFullYear(), trackDate.getMonth(), trackDate.getDate());
          const daysFromStart = Math.floor((localDate - earliestDay30) / (86400 * 1000));
          if (daysFromStart >= 0 && daysFromStart < 30) {
            counts[daysFromStart] += 1;
          }
        });
        peakValue = Math.max(...counts);
        break;

      default:
        labels = [];
        counts = [];
        peakValue = 0;
    }

    const chartData = {
      labels,
      datasets: [{
        label: 'Tracks Played',
        data: counts,
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(217, 70, 239, 0.7)',
      }],
    };

    const stats = {
      totalTracks,
      uniqueTracks,
      peakValue,
      peakLabel: timeRange === '24h' ? 'Peak Tracks per Hour' : 'Peak Tracks per Day',
    };

    return { chartData, stats };
  };

  const { chartData, stats } = getChartDataAndStats();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            if (timeRange === '24h') {
              const now = new Date();
              const currentHourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
              const earliestStart = new Date(currentHourStart.getTime() - 24 * 3600 * 1000);
              const slotStart = new Date(earliestStart.getTime() + index * 3600 * 1000);
              const slotEnd = new Date(slotStart.getTime() + 3600 * 1000);
              return `Between ${slotStart.toLocaleString()} and ${slotEnd.toLocaleString()}`;
            } else if (timeRange === '7d') {
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
              const day = new Date(today.getTime() - (6 - index) * 86400 * 1000);
              return day.toLocaleDateString();
            } else if (timeRange === '30d') {
              const today30 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
              const day = new Date(today30.getTime() - (29 - index) * 86400 * 1000);
              return day.toLocaleDateString();
            }
            return context[0].label;
          },
          label: (context) => `${context.parsed.y} tracks`,
        },
        titleColor: '#fff',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        bodyColor: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-400">
          <FaClock className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Listening Activity</h2>
        </div>

        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-gray-700 text-primary-400'
                  : 'text-gray-400 hover:text-primary-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-400">
            {stats.totalTracks}
          </div>
          <div className="text-sm text-gray-400">Total Tracks</div>
        </div>
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-400">
            {stats.uniqueTracks}
          </div>
          <div className="text-sm text-gray-400">Unique Tracks</div>
        </div>
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-400">
            {stats.peakValue}
          </div>
          <div className="text-sm text-gray-400">{stats.peakLabel}</div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Listening Pattern (Local Time)</h3>
        <Bar data={chartData} options={chartOptions} className="w-full h-64" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recently Played Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.tracks.slice(0, 10).map(track => (
            <div key={`${track.id}-${track.played_at}`} className="card group">
              <div className="flex items-center gap-4">
                {track.image && (
                  <img
                    src={track.image}
                    alt={`${track.album} cover`}
                    className="w-16 h-16 rounded-lg shadow-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate group-hover:text-primary-400 transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">
                    {track.artist}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(track.played_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={track.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-400 transition-colors"
                >
                  <FaSpotify className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentlyPlayed;