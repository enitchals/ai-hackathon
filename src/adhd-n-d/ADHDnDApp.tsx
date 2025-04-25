import React, { useState } from 'react';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { TodoProvider, useTodo, TodoItem } from './TodoContext';
import TodoList from './TodoList';
import AddTodoForm from './AddTodoForm';
import D20Roller from './D20Roller';
import TaskModal from './TaskModal';
import TimerModal from './TimerModal';
import DoneList from './DoneList';
import D20Image from '../assets/d20.png';
import AppHeader from '../components/AppHeader';

const MAX_VISIBLE = 19;

const ADHDnDInner: React.FC = () => {
  const { todoList, markDone, moveToEnd } = useTodo();
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tab, setTab] = useState(0);
  const [rollNumber, setRollNumber] = useState<number | null>(null);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerLabel, setTimerLabel] = useState('Break Time! 🎉');

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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="ADHDnD">
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Tasks" />
          <Tab label="Completed" />
        </Tabs>
      </AppHeader>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 ? (
          <>
            <D20Roller onRoll={handleRoll} />
            <AddTodoForm />
            <TodoList />
          </>
        ) : (
          <DoneList />
        )}
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
    </Box>
  );
};

const ADHDnDApp: React.FC = () => (
  <TodoProvider>
    <ADHDnDInner />
  </TodoProvider>
);

export default ADHDnDApp; 