import React, { useState } from 'react';
import { List, ListItem, ListItemText, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTodo } from './TodoContext';
import { Box } from '@mui/material';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MAX_VISIBLE = 19;

function DraggableTodoItem({ item, idx, onRemove }: { item: any; idx: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <ListItem
      ref={setNodeRef}
      divider
      dense
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#f0f0f0' : undefined,
        cursor: 'grab',
      }}
      secondaryAction={
        <Tooltip title="Delete">
          <IconButton edge="end" aria-label="delete" onClick={() => onRemove(item.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      }
      {...attributes}
      {...listeners}
    >
      <ListItemText
        primary={<span><strong>#{idx + 1}:</strong> {item.text}</span>}
      />
    </ListItem>
  );
}

const TodoList: React.FC = () => {
  const { todoList, removeTodo, clearTodoList, reorderTodoList } = useTodo();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const visible = todoList.slice(0, MAX_VISIBLE);
  const hiddenCount = todoList.length - MAX_VISIBLE;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = visible.findIndex((item) => item.id === active.id);
      const newIndex = visible.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newVisible = arrayMove(visible, oldIndex, newIndex);
        // Merge reordered visible with hidden items (if any)
        const newOrder = [...newVisible, ...todoList.slice(MAX_VISIBLE)];
        reorderTodoList(newOrder);
      }
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mt: 2 }}>
          To-Do List
        </Typography>
        <Button variant="outlined" color="error" size="small" onClick={() => setConfirmOpen(true)} disabled={todoList.length === 0}>
          Clear List
        </Button>
      </Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visible.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <List sx={{ maxHeight: '100%', overflowY: 'auto' }}>
            {visible.map((item, idx) => (
              <DraggableTodoItem key={item.id} item={item} idx={idx} onRemove={removeTodo} />
            ))}
          </List>
        </SortableContext>
      </DndContext>
      {hiddenCount > 0 && (
        <Typography color="error" variant="body2" align="center">
          {hiddenCount} additional item{hiddenCount > 1 ? 's are' : ' is'} hidden
        </Typography>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Clear All To-Dos?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete all to-do items? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => { clearTodoList(); setConfirmOpen(false); }} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TodoList; 