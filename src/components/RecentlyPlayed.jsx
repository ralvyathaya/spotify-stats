import React, { useState, useEffect } from 'react';
import { FaSpotify, FaClock } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function RecentlyPlayed({ accessToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/recently-played', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
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
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="text-gray-500 text-center">
        No recently played tracks found
      </div>
    );
  }

  // Prepare chart data
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const trackCounts = hours.map(hour => data.analytics.tracksByHour[hour]?.length || 0);
  
  const chartData = {
    labels: hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Tracks Played',
        data: trackCounts,
        fill: true,
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderColor: 'rgb(14, 165, 233)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-primary-600">
        <FaClock className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Listening Activity</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-600">
            {data.analytics.totalTracks}
          </div>
          <div className="text-sm text-gray-600">Total Tracks</div>
        </div>
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-600">
            {data.analytics.uniqueTracks}
          </div>
          <div className="text-sm text-gray-600">Unique Tracks</div>
        </div>
        <div className="stats-card">
          <div className="text-3xl font-bold text-primary-600">
            {Math.max(...trackCounts)}
          </div>
          <div className="text-sm text-gray-600">Peak Tracks per Hour</div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Listening Pattern</h3>
        <Line data={chartData} options={chartOptions} className="w-full h-64" />
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
                  <h4 className="font-semibold truncate group-hover:text-primary-600 transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-gray-600 text-sm truncate">
                    {track.artist}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(track.played_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={track.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600 transition-colors"
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