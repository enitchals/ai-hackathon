import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TodoItem {
  id: string;
  text: string;
}

interface TodoContextType {
  todoList: TodoItem[];
  doneList: TodoItem[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  moveToEnd: (id: string) => void;
  markDone: (id: string) => void;
  clearDoneList: () => void;
  clearTodoList: () => void;
  reorderTodoList: (newList: TodoItem[]) => void;
}

const TODO_KEY = 'adhdnd-todo';
const DONE_KEY = 'adhdnd-done';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used within a TodoProvider');
  return ctx;
};

function getInitialList(key: string): TodoItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todoList, setTodoList] = useState<TodoItem[]>(() => getInitialList(TODO_KEY));
  const [doneList, setDoneList] = useState<TodoItem[]>(() => getInitialList(DONE_KEY));

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(TODO_KEY, JSON.stringify(todoList));
  }, [todoList]);
  useEffect(() => {
    localStorage.setItem(DONE_KEY, JSON.stringify(doneList));
  }, [doneList]);

  const addTodo = (text: string) => {
    setTodoList((prev) => [...prev, { id: crypto.randomUUID(), text }]);
  };

  const removeTodo = (id: string) => {
    setTodoList((prev) => prev.filter((item) => item.id !== id));
  };

  const moveToEnd = (id: string) => {
    setTodoList((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const item = prev[idx];
      const newList = prev.filter((i) => i.id !== id);
      return [...newList, item];
    });
  };

  const markDone = (id: string) => {
    setTodoList((prev) => prev.filter((i) => i.id !== id));
    setDoneList((done) => {
      // Find the item in the current todoList or in the previous doneList
      const item = todoList.find((i) => i.id === id);
      if (!item || done.some((d) => d.id === id)) return done;
      return [...done, item];
    });
  };

  const clearDoneList = () => {
    setDoneList([]);
  };

  const clearTodoList = () => {
    setTodoList([]);
  };

  const reorderTodoList = (newList: TodoItem[]) => {
    setTodoList(newList);
  };

  return (
    <TodoContext.Provider value={{ todoList, doneList, addTodo, removeTodo, moveToEnd, markDone, clearDoneList, clearTodoList, reorderTodoList }}>
      {children}
    </TodoContext.Provider>
  );
}; 