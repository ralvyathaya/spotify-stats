import React from 'react';

function SongList({ songs }) {
  return (
    <div>
      <h2>Recommended Songs</h2>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            {song.name} by {song.artist}
            {song.preview_url && (
              <audio controls>
                <source src={song.preview_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;

