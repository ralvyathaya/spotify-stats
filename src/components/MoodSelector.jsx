import React from 'react';

function MoodSelector({ onMoodSelect }) {
  const moods = ['happy', 'sad', 'energetic', 'relaxed', 'angry'];

  return (
    <div>
      <h2>How are you feeling?</h2>
      {moods.map(mood => (
        <button key={mood} onClick={() => onMoodSelect(mood)}>
          {mood}
        </button>
      ))}
    </div>
  );
}

export default MoodSelector;

