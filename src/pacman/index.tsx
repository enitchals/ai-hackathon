import React from 'react';
import AppHeader from '../components/AppHeader';
import PacManGame from './PacManGame';

const PacMan: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Pac-Man" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <PacManGame />
        <div style={{ color: '#fff', fontSize: 16, marginTop: 32, textAlign: 'center', maxWidth: 320 }}>
          <strong>Tip:</strong> On mobile, swipe in any direction to move Pac-Man!
        </div>
      </div>
    </div>
  );
};

export default PacMan; 