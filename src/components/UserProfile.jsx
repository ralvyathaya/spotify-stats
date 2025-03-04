import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

function UserProfile({ accessToken, onLogout }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user profile');
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      }
    };

    fetchUserProfile();
  }, [accessToken]);

  if (error || !user) {
    return (
      <button
        onClick={onLogout}
        className="btn-secondary"
      >
        Logout
      </button>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        {user.images?.[0]?.url ? (
          <img
            src={user.images[0].url}
            alt={user.display_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <FaUser className="w-4 h-4 text-primary-600" />
          </div>
        )}
        <span className="hidden sm:block font-medium text-gray-700">{user.display_name}</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 py-1 focus:outline-none">
        <Menu.Item>
          {({ active }) => (
            <div className="px-4 py-3 border-b border-gray-100 text-sm">
              <div className="truncate font-medium text-gray-900">{user.display_name}</div>
              <div className="truncate text-xs text-gray-500">{user.email}</div>
            </div>
          )}
        </Menu.Item>
        
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={onLogout}
              className={`${
                active ? 'bg-gray-50 text-primary-600' : 'text-gray-700'
              } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}

export default UserProfile;
