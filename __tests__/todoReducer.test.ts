/**
 * Unit tests for the TODO reducer (state transitions).
 * Covers add, toggle, update, delete, and setItems.
 */
import { todoReducer } from '../src/context/TodoContext';
import type { TodoItem } from '../src/types/todo';

const emptyState = { items: [] };

describe('todoReducer', () => {
  it('ADD adds a new item with correct shape', () => {
    const next = todoReducer(emptyState, { type: 'ADD', payload: { text: 'First task' } });
    expect(next.items).toHaveLength(1);
    expect(next.items[0]).toMatchObject({ text: 'First task', completed: false });
    expect(next.items[0].id).toMatch(/^todo_/);
  });

  it('TOGGLE flips completed for the given id', () => {
    const state: { items: TodoItem[] } = {
      items: [
        { id: 'a', text: 'Task A', completed: false },
        { id: 'b', text: 'Task B', completed: true },
      ],
    };
    const next = todoReducer(state, { type: 'TOGGLE', payload: { id: 'a' } });
    expect(next.items[0].completed).toBe(true);
    expect(next.items[1].completed).toBe(true);
  });

  it('UPDATE changes text for the given id', () => {
    const state: { items: TodoItem[] } = {
      items: [{ id: 'x', text: 'Old', completed: false }],
    };
    const next = todoReducer(state, { type: 'UPDATE', payload: { id: 'x', text: 'New' } });
    expect(next.items[0].text).toBe('New');
  });

  it('DELETE removes the item with the given id', () => {
    const state: { items: TodoItem[] } = {
      items: [
        { id: '1', text: 'One', completed: false },
        { id: '2', text: 'Two', completed: false },
      ],
    };
    const next = todoReducer(state, { type: 'DELETE', payload: { id: '1' } });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe('2');
  });

  it('SET_ITEMS replaces the entire list', () => {
    const state: { items: TodoItem[] } = {
      items: [{ id: 'old', text: 'Old', completed: false }],
    };
    const newItems: TodoItem[] = [
      { id: 'n1', text: 'New 1', completed: true },
      { id: 'n2', text: 'New 2', completed: false },
    ];
    const next = todoReducer(state, { type: 'SET_ITEMS', payload: { items: newItems } });
    expect(next.items).toEqual(newItems);
  });

  it('returns same state for unknown action type', () => {
    const state = { items: [{ id: 'x', text: 'Only', completed: false }] };
    const next = todoReducer(state, { type: 'UNKNOWN' as any, payload: {} as any });
    expect(next).toBe(state);
  });
});
