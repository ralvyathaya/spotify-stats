import React, { useState, useEffect } from 'react';
import SpotifyLogin from './components/SpotifyLogin';
import TopTracks from './components/TopTracks';
import TopArtists from './components/TopArtists';
import RecentlyPlayed from './components/RecentlyPlayed';
import NowPlaying from './components/NowPlaying';
import UserProfile from './components/UserProfile';
import { Tab } from '@headlessui/react';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('short_term');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const error = urlParams.get('error');
    
    if (error) {
      setError('Failed to authenticate with Spotify');
      localStorage.removeItem('spotify_access_token');
    } else if (token) {
      handleLogin(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  const handleLogin = (token) => {
    setAccessToken(token);
    setError(null);
    localStorage.setItem('spotify_access_token', token);
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
  };

  const timeRangeOptions = [
    { value: 'short_term', label: '4 Weeks' },
    { value: 'medium_term', label: '6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  const recentlyPlayedOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  if (!accessToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 gradient-text py-2">
          yourSpotifyStats
        </h1>
        {error && (
          <div className="text-red-500 text-center mb-6 font-medium">
            {error}
          </div>
        )}
        <SpotifyLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-display font-bold gradient-text py-2">
          Here's Your Spotify Stats & Insights
        </h1>
        <UserProfile accessToken={accessToken} onLogout={handleLogout} />
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <NowPlaying accessToken={accessToken} />
        </div>

        <Tab.Group onChange={setSelectedTab}>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Tab.List className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Tab className={({ selected }) =>
                `px-4 py-2 rounded-md font-medium transition-all ${
                  selected
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-primary-600'
                }`
              }>
                Top Tracks
              </Tab>
              <Tab className={({ selected }) =>
                `px-4 py-2 rounded-md font-medium transition-all ${
                  selected
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-primary-600'
                }`
              }>
                Top Artists
              </Tab>
              <Tab className={({ selected }) =>
                `px-4 py-2 rounded-md font-medium transition-all ${
                  selected
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-primary-600'
                }`
              }>
                Recently Played
              </Tab>
            </Tab.List>

            {selectedTab !== 2 && (
              <div className="flex gap-2">
                {timeRangeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      timeRange === option.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tab.Panels>
            <Tab.Panel>
              <TopTracks accessToken={accessToken} timeRange={timeRange} />
            </Tab.Panel>
            <Tab.Panel>
              <TopArtists accessToken={accessToken} timeRange={timeRange} />
            </Tab.Panel>
            <Tab.Panel>
              <RecentlyPlayed accessToken={accessToken} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>

      <footer className="max-w-7xl mx-auto mt-16 py-8 border-t border-gray-200 text-center text-gray-500">
        <p>Get insights about your Spotify listening habits</p>
      </footer>
    </div>
  );
}

export default App;
