import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, useMediaQuery } from '@mui/material';
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
const ONBOARD_KEY = 'adhdnd-onboarded';
const PREPOPULATED_TASKS = [
  'Drink a glass of water',
  'Go for a short walk',
  'Reply to one email',
  'Tidy up your desk',
  'Add your own task...'
];

const SUGGESTED_TASKS = [
  'Drink a glass of water',
  'Go for a short walk',
  'Reply to one email',
  'Tidy up your desk',
  'Add your own task...',
  'Stretch for 2 minutes',
  'Organize your desktop',
  'Check your calendar',
  'Send a thank you message',
  'Take a deep breath',
  'Refill your water bottle',
  'Wipe down your keyboard',
  'Stand up and move',
  'Write down a quick idea',
  'Review your to-do list',
];

const ADHDnDInner: React.FC = () => {
  const { todoList, markDone, moveToEnd, addTodo } = useTodo();
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tab, setTab] = useState(0);
  const [rollNumber, setRollNumber] = useState<number | null>(null);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerLabel, setTimerLabel] = useState('Break Time! 🎉');
  const [showOnboard, setShowOnboard] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const navLabels = ['tasks', 'completed', 'suggestions'];

  useEffect(() => {
    if (!localStorage.getItem(ONBOARD_KEY)) {
      setShowOnboard(true);
    }
  }, []);

  const handleOnboardClose = () => {
    setShowOnboard(false);
    localStorage.setItem(ONBOARD_KEY, '1');
    if (todoList.length === 0) {
      PREPOPULATED_TASKS.forEach((task) => addTodo(task));
    }
  };

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

  const handleAddSuggestion = (task: string) => {
    if (!todoList.some((t) => t.text === task)) {
      addTodo(task);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        title="adhdnd"
        navLabels={navLabels}
        tab={tab}
        onTabChange={setTab}
      >
        {!isMobile && (
          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} aria-label="adhdnd navigation tabs">
            <Tab label="tasks" />
            <Tab label="completed" />
            <Tab label="suggestions" />
          </Tabs>
        )}
      </AppHeader>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 ? (
          <>
            <D20Roller onRoll={handleRoll} />
            <AddTodoForm />
            <Typography variant="h6" fontWeight={700} gutterBottom>to-do list</Typography>
            <TodoList />
          </>
        ) : tab === 1 ? (
          <>
            <Typography variant="h6" fontWeight={700} gutterBottom>done list</Typography>
            <DoneList />
          </>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>suggested tasks</Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }} aria-label="Suggested Tasks List">
              {SUGGESTED_TASKS.filter(
                (task) => !todoList.some((t) => t.text === task)
              ).length === 0 ? (
                <Typography color="text.secondary">no more suggestions available!</Typography>
              ) : (
                SUGGESTED_TASKS.filter(
                  (task) => !todoList.some((t) => t.text === task)
                ).map((task) => (
                  <Box key={task} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      aria-label={`add suggested task: ${task}`}
                      onClick={() => handleAddSuggestion(task)}
                      sx={{ mr: 1 }}
                    >
                      +
                    </Button>
                    <Typography sx={{ flexGrow: 1 }}>{task.toLowerCase()}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Box mt={2}>
        <Button variant="outlined" color="primary" onClick={() => handleTakeBreak(300)} sx={{ mr: 1 }}>take a 5-min break</Button>
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
      <Dialog open={showOnboard} onClose={handleOnboardClose} maxWidth="xs" fullWidth>
        <DialogTitle>welcome to adhdnd!</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography gutterBottom>keep your tasks small and specific - ideally no more than 5-10 minutes. roll the die to pick your next task!</Typography>
            <Typography gutterBottom>good luck, adventurer!</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleOnboardClose} autoFocus>
            get started
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ADHDnDApp: React.FC = () => (
  <TodoProvider>
    <ADHDnDInner />
  </TodoProvider>
);

export default ADHDnDApp; 