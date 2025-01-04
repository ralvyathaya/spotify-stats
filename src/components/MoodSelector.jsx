// MoodSelector.jsx
import React from 'react';

const moods = [
  { name: 'happy', emoji: '😊', label: 'Happy' },
  { name: 'sad', emoji: '😢', label: 'Sad' },
  { name: 'energetic', emoji: '⚡', label: 'Energetic' },
  { name: 'relaxed', emoji: '😌', label: 'Relaxed' },
  { name: 'angry', emoji: '😠', label: 'Angry' },
];

function MoodSelector({ onMoodSelect }) {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-retro text-retro-cyan mb-8 text-center">
        How are you feeling today?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {moods.map(({ name, emoji, label }) => (
          <button
            key={name}
            onClick={() => onMoodSelect(name)}
            className="bg-retro-black border-2 border-retro-purple p-6 rounded-lg 
            hover:bg-retro-purple/10 transition-all duration-300 card-hover
            flex flex-col items-center gap-3"
          >
            <span className="text-4xl" role="img" aria-label={name}>
              {emoji}
            </span>
            <span className="font-retro text-sm text-retro-cyan">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;