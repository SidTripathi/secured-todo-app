import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { TodoItem } from '../types/todo';

// --- State shape ---
export interface TodoState {
  items: TodoItem[];
}

// --- Actions for state updates (clean unidirectional flow) ---
type TodoAction =
  | { type: 'ADD'; payload: { text: string } }
  | { type: 'TOGGLE'; payload: { id: string } }
  | { type: 'UPDATE'; payload: { id: string; text: string } }
  | { type: 'DELETE'; payload: { id: string } }
  | { type: 'SET_ITEMS'; payload: { items: TodoItem[] } };

const initialState: TodoState = {
  items: [],
};

function generateId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Exported for unit tests. */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        items: [
          ...state.items,
          { id: generateId(), text: action.payload.text, completed: false },
        ],
      };
    case 'TOGGLE':
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, completed: !item.completed }
            : item
        ),
      };
    case 'UPDATE':
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, text: action.payload.text }
            : item
        ),
      };
    case 'DELETE':
      return {
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case 'SET_ITEMS':
      return { items: action.payload.items };
    default:
      return state;
  }
}

// --- Context and provider ---
interface TodoContextValue extends TodoState {
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const addTodo = useCallback((text: string) => {
    dispatch({ type: 'ADD', payload: { text } });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE', payload: { id } });
  }, []);

  const updateTodo = useCallback((id: string, text: string) => {
    dispatch({ type: 'UPDATE', payload: { id, text } });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: { id } });
  }, []);

  const value: TodoContextValue = useMemo(
    () => ({
      ...state,
      addTodo,
      toggleTodo,
      updateTodo,
      deleteTodo,
    }),
    [state, addTodo, toggleTodo, updateTodo, deleteTodo]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used within TodoProvider');
  return ctx;
}
