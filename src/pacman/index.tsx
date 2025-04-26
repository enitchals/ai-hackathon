import React from 'react';
import AppHeader from '../components/AppHeader';
import PacManGame from './PacManGame';

const PacMan: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="pac-man" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <PacManGame />
        <div style={{ color: '#fff', fontSize: 16, marginTop: 32, textAlign: 'center', maxWidth: 320 }}>
          <strong>tip:</strong> on mobile, swipe in any direction to move pac-man!
        </div>
      </div>
    </div>
  );
};

export default PacMan; 