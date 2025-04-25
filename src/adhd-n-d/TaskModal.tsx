import React from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { TodoItem } from './TodoContext';

interface TaskModalProps {
  open: boolean;
  task: TodoItem | null;
  onDone: () => void;
  onGiveUp: () => void;
  onClose: () => void;
  rollNumber?: number;
  dieImage?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ open, task, onDone, onGiveUp, onClose, rollNumber, dieImage }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        {rollNumber && dieImage && (
          <div style={{ position: 'relative', margin: '0 auto', width: 180, height: 180 }}>
            <img
              src={dieImage}
              alt="D20"
              style={{ width: 180, height: 180, display: 'block', margin: '0 auto' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -75%)',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'black',
                textShadow: '0 1px 4px rgba(255,255,255,0.7)',
                userSelect: 'none',
              }}
            >
              {rollNumber}
            </div>
          </div>
        )}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{task ? task.text : ''}</span>
        </div>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="contained" color="success" onClick={onDone} sx={{ minWidth: 120 }}>
          I DID IT!
        </Button>
        <Button variant="contained" color="error" onClick={onGiveUp} sx={{ minWidth: 120, ml: 2 }}>
          I GIVE UP
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal; 