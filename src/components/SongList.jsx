// SongList.jsx
import React from 'react';

function SongList({ songs }) {
  if (!songs.length) {
    return (
      <div className="text-center font-retro text-retro-cyan">
        No songs found for this mood. Try another one!
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-retro text-retro-cyan mb-8 text-center">
        Recommended Songs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-retro-black border-2 border-retro-purple rounded-lg overflow-hidden card-hover"
          >
            {song.image && (
              <img
                src={song.image}
                alt={`${song.album} album cover`}
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-retro text-retro-pink text-sm truncate">
                {song.name}
              </h3>
              <p className="text-retro-cyan text-xs mt-1 truncate">
                {song.artist}
              </p>
              <p className="text-gray-400 text-xs mt-1 truncate">
                {song.album}
              </p>
              <div className="mt-4 flex gap-2">
                {song.preview_url && (
                  <audio
                    controls
                    className="w-full h-8"
                  >
                    <source src={song.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <a
                  href={song.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-retro-purple hover:text-retro-purple/80 underline"
                >
                  Open in Spotify
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongList;