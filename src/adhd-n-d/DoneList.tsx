import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Button } from '@mui/material';
import { useTodo } from './TodoContext';

const DoneList: React.FC = () => {
  const { doneList, clearDoneList } = useTodo();

  if (doneList.length === 0) {
    return (
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary" align="center">
          No completed tasks yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Done List
        </Typography>
        <Button variant="outlined" color="error" size="small" onClick={clearDoneList}>
          Clear List
        </Button>
      </Box>
      <List>
        {doneList.map((item, idx) => (
          <ListItem key={item.id} divider dense>
            <ListItemText
              primary={<span><strong>#{idx + 1}:</strong> {item.text}</span>}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DoneList; 