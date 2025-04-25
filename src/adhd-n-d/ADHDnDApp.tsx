import React, { useState } from 'react';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { TodoProvider, useTodo, TodoItem } from './TodoContext';
import TodoList from './TodoList';
import AddTodoForm from './AddTodoForm';
import TaskModal from './TaskModal';
import TimerModal from './TimerModal';
import DoneList from './DoneList';
import D20Image from './d20.png';
import AppHeader from '../components/AppHeader';

const MAX_VISIBLE = 19;

const ADHDnDInner: React.FC = () => {
  const { todoList, markDone, moveToEnd } = useTodo();
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tab, setTab] = useState(0);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerLabel, setTimerLabel] = useState('Break Time! 🎉');

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