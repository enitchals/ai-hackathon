import React, { useState } from 'react';
import { Typography, Box, Paper, IconButton, Tooltip, Tabs, Tab, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ThemePickerModal from '../ThemePickerModal';
import { useThemeContext } from '../main';
import { useNavigate } from 'react-router-dom';
import { TodoProvider, useTodo, TodoItem } from './TodoContext';
import TodoList from './TodoList';
import AddTodoForm from './AddTodoForm';
import D20Roller from './D20Roller';
import TaskModal from './TaskModal';
import TimerModal from './TimerModal';
import DoneList from './DoneList';
import D20Image from './d20.png';

const MAX_VISIBLE = 19;

const ADHDnDInner: React.FC = () => {
  const { todoList, markDone, moveToEnd } = useTodo();
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState<number | null>(null);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerLabel, setTimerLabel] = useState('Break Time! 🎉');
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const { themeName, setThemeName } = useThemeContext();

  const handleRoll = (value: number) => {
    setRollNumber(value);
    if (value === 20) {
      setTimerLabel('Break Time! 🎉');
      setTimerDuration(300);
      setTimerModalOpen(true);
      setSelectedTask(null);
      setShowTaskModal(false);
    } else {
      const visible = todoList.slice(0, MAX_VISIBLE);
      if (visible.length === 0) return;
      const idx = (value - 1) % visible.length;
      setSelectedTask(visible[idx]);
      setShowTaskModal(true);
    }
  };

  const handleTakeBreak = (duration: number) => {
    setTimerLabel(`Break Time! (${duration / 60} min)`);
    setTimerDuration(duration);
    setTimerModalOpen(true);
  };

  const handleDone = () => {
    if (selectedTask) markDone(selectedTask.id);
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleGiveUp = () => {
    if (selectedTask) moveToEnd(selectedTask.id);
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  return (
    <Box textAlign="center" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', py: 3 }}>
      <Box display="flex" alignItems="center" mb={1} sx={{ maxWidth: 400, minWidth: '33vw', mx: 'auto', width: '100%', position: 'relative' }}>
        <Tooltip title="Back to Gallery">
          <IconButton onClick={() => navigate('/')} size="large" sx={{ position: 'absolute', left: 0 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h4" component="h2" gutterBottom textAlign="center">
            ADHDnD
          </Typography>
        </Box>
        <Tooltip title="Change Theme">
          <IconButton onClick={() => setThemeModalOpen(true)} size="large" sx={{ position: 'absolute', right: 0 }}>
            <ColorLensIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ maxWidth: 600, minWidth: '33vw', mx: 'auto', mb: 2, flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="To-Do" />
          <Tab label="Done" />
        </Tabs>
        <Paper elevation={2} sx={{ p: 2, mt: 1, flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {tab === 0 ? (
            <>
              <D20Roller onRoll={handleRoll} />
              <AddTodoForm />
              <Box sx={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', mt: 2 }}>
                <TodoList />
              </Box>
            </>
          ) : (
            <Box sx={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
              <DoneList />
            </Box>
          )}
        </Paper>
      </Box>
      <Box mt={2}>
        <Button variant="outlined" color="primary" onClick={() => handleTakeBreak(300)} sx={{ mr: 1 }}>Take a 5-min Break</Button>
        <Button variant="outlined" color="primary" onClick={() => handleTakeBreak(600)} sx={{ mr: 1 }}>10-min</Button>
        <Button variant="outlined" color="primary" onClick={() => handleTakeBreak(1200)}>20-min</Button>
      </Box>
      <TaskModal
        open={showTaskModal}
        task={selectedTask}
        onDone={handleDone}
        onGiveUp={handleGiveUp}
        onClose={() => setShowTaskModal(false)}
        rollNumber={rollNumber && rollNumber !== 20 ? rollNumber : undefined}
        dieImage={rollNumber && rollNumber !== 20 ? D20Image : undefined}
      />
      <TimerModal
        open={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        duration={timerDuration}
        label={timerLabel}
        onComplete={() => {}}
        beepOnComplete={true}
        showStartButton={true}
        showEndButton={true}
      />
      <ThemePickerModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onSelectTheme={(name) => { setThemeName(name); setThemeModalOpen(false); }}
        selectedTheme={themeName}
      />
    </Box>
  );
};

const ADHDnDApp: React.FC = () => (
  <TodoProvider>
    <ADHDnDInner />
  </TodoProvider>
);

export default ADHDnDApp; 