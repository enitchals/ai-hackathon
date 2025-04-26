import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Button } from '@mui/material';
import { useTodo } from './TodoContext';
import { useTheme } from '@mui/material/styles';

const DoneList: React.FC = () => {
  const { doneList, clearDoneList } = useTodo();
  const theme = useTheme();

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
      <List role="list" aria-label="Completed Tasks List">
        {doneList.map((item, idx) => (
          <ListItem key={item.id} divider dense role="listitem">
            <ListItemText
              primary={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  {item.text}
                </span>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DoneList; 