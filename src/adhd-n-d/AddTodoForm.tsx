import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useTodo } from './TodoContext';

const AddTodoForm: React.FC = () => {
  const { addTodo } = useTodo();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      addTodo(value.trim());
      setValue('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="flex" gap={1} mt={2} mb={2}>
      <TextField
        label="add a to-do item"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        size="small"
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary" sx={{ flexShrink: 0 }}>
        add
      </Button>
    </Box>
  );
};

export default AddTodoForm; 