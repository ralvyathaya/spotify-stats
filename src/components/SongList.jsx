// SongList.jsx
import React from 'react';

function SongList({ songs }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-press-start mb-6 text-retro-purple neon-glow">Recommended Songs</h2>
      <div className="grid gap-6">
        {songs.map(song => (
          <div 
            key={song.id}
            className="bg-retro-black/50 border border-retro-purple rounded-lg p-6 card-hover"
          >
            <div className="mb-3">
              <h3 className="font-press-start text-lg text-white">{song.name}</h3>
              <p className="text-retro-purple/80 font-inter">{song.artist}</p>
              <p className="text-sm text-gray-400 font-inter">{song.album}</p>
            </div>
            {song.preview_url && (
              <audio
                controls
                className="w-full mt-4 audio-player"
              >
                <source src={song.preview_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongList;