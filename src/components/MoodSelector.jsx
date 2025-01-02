// MoodSelector.jsx
import React from 'react';

function MoodSelector({ onMoodSelect }) {
  const moods = ['happy', 'sad', 'energetic', 'relaxed', 'angry'];
  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    energetic: '⚡',
    relaxed: '😌',
    angry: '😠'
  };

  return (
    <div className="my-8">
      <h2 className="text-3xl font-press-start mb-6 text-retro-purple neon-glow">How are you feeling?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {moods.map(mood => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className="bg-retro-black border-2 border-retro-purple p-4 rounded-lg 
            hover:bg-retro-purple/20 transition-all duration-300 card-hover
            font-press-start text-sm uppercase"
          >
            <span className="block text-2xl mb-2">{moodEmojis[mood]}</span>
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;