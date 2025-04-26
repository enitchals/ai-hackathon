import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface TimerModalProps {
  open: boolean;
  onClose: () => void;
  duration: number;
  label: string;
  onComplete: () => void;
  beepOnComplete: boolean;
  showStartButton: boolean;
  showEndButton: boolean;
}

const TimerModal: React.FC<TimerModalProps> = ({ open, onClose, duration, label, onComplete, beepOnComplete, showStartButton, showEndButton }) => {
  const [seconds, setSeconds] = useState(duration);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(!showStartButton);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setSeconds(duration);
      setRunning(false);
      setStarted(!showStartButton);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, duration, showStartButton]);

  useEffect(() => {
    if (running && started && open) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (beepOnComplete) playBeep();
            onComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, started, open, beepOnComplete, onComplete]);

  const handleStart = () => {
    setStarted(true);
    setRunning(true);
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(duration);
    setStarted(!showStartButton);
    onClose();
  };

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const isZero = seconds === 0;

  function playBeep() {
    try {
      const _window = window as typeof window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext || _window.webkitAudioContext;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 700;
      g.gain.value = 0.2;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.4);
      o.onended = () => ctx.close();
    } catch {
      // Ignore audio errors
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{label && typeof label === 'string' ? label.toLowerCase() : label}</DialogTitle>
      <DialogContent>
        <Typography align="center" variant="h6" gutterBottom>
          {label && typeof label === 'string' ? label.toLowerCase() : label}
        </Typography>
        <Box
          textAlign="center"
          sx={{
            fontSize: 48,
            fontWeight: 'bold',
            color: isZero ? 'error.main' : 'primary.main',
            transition: 'color 0.2s',
            animation: isZero ? 'flash 1s infinite alternate' : 'none',
          }}
        >
          {`${min}:${sec.toString().padStart(2, '0')}`}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        {showStartButton && !started && (
          <Button variant="contained" color="primary" onClick={handleStart}>
            start
          </Button>
        )}
        {showEndButton && (
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            end
          </Button>
        )}
      </DialogActions>
      <style>{`
        @keyframes flash {
          from { color: #d32f2f; }
          to { color: #fff; }
        }
      `}</style>
    </Dialog>
  );
};

export default TimerModal; 