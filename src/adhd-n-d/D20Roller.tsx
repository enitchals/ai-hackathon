import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import D20Image from './d20.png'; // Assume the image is saved as d20.png in the same folder

interface D20RollerProps {
  onRoll: (value: number) => void;
}

const D20Roller: React.FC<D20RollerProps> = ({ onRoll }) => {
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      const value = Math.floor(Math.random() * 20) + 1;
      // const value = 20; // TEMP: always roll 20 for testing
      setLastRoll(value);
      setRolling(false);
      onRoll(value);
    }, 400); // Simulate a short roll animation
  };

  return (
    <Box textAlign="center" my={2}>
      <img src={D20Image} alt="D20" style={{ width: 80, height: 80, display: 'block', margin: '0 auto 12px auto' }} />
      <Button
        variant="contained"
        color="secondary"
        size="large"
        onClick={handleRoll}
        disabled={rolling}
        sx={{ fontSize: 20, minWidth: 100 }}
      >
        Roll
      </Button>
    </Box>
  );
};

export default D20Roller; 