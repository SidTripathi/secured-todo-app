import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TodoItem } from './TodoItem';
import { useTodo } from '../context/TodoContext';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { app, todoList } from '../utils/strings';
import { theme } from '../shared/theme';
import type { TodoItem as TodoItemType } from '../types/todo';

const ITEM_HEIGHT = 56;

/**
 * TodoListComponent
 * - Renders the main list UI: header, input row for adding items, and a FlatList
 *   of `TodoItem` rows.
 * - All modifications (add/toggle/update/delete) require local auth. Instead of
 *   each child calling auth directly, the list provides `handleRequestAuth`
 *   which invokes `authenticate()` and runs the provided action on success.
 */
function TodoListComponent() {
  // Access todo state and mutators from context
  const { items, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodo();

  // Local auth hook: `authenticate(prompt)` returns { success, error }
  // `isChecking` indicates whether an auth attempt is in progress and is used
  // to disable inputs while authenticating.
  const { authenticate, isChecking } = useLocalAuth();

  // Controlled input state for creating a new todo
  const [newText, setNewText] = useState('');

  // Wrapper used across actions to require auth before executing the mutation.
  // The `action` callback is only invoked if authentication succeeds.
  const handleRequestAuth = useCallback(
    async (action: () => void) => {
      const result = await authenticate(todoList.authPromptModify);
      if (result.success) {
        action();
      }
    },
    [authenticate]
  );

  // Add a new todo: trim input, require auth, then add and clear input.
  const handleAdd = useCallback(async () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    await handleRequestAuth(() => {
      addTodo(trimmed);
      setNewText('');
    });
  }, [newText, handleRequestAuth, addTodo]);

  // Render each item by passing down the mutation callbacks and the
  // `handleRequestAuth` wrapper so child rows can request auth for their actions.
  const renderItem = useCallback(
    ({ item }: { item: TodoItemType }) => (
      <TodoItem
        item={item}
        onToggle={toggleTodo}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        onRequestAuth={handleRequestAuth}
      />
    ),
    [toggleTodo, updateTodo, deleteTodo, handleRequestAuth]
  );

  const keyExtractor = useCallback((item: TodoItemType) => item.id, []);

  // Optimize list layout by returning fixed-height item metadata to FlatList.
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Shown when the list has no items
  const listEmptyComponent = useMemo(
    () => <Text style={styles.empty}>{todoList.emptyList}</Text>,
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{app.title}</Text>
      <Text style={styles.subtitle}>{todoList.subtitle}</Text>

      {/* Input row: text entry and add button. Disabled while auth is running. */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={todoList.inputPlaceholder}
          placeholderTextColor={theme.colors.placeholder}
          value={newText}
          onChangeText={setNewText}
          editable={!isChecking}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addButton, isChecking && styles.addButtonDisabled]}
          disabled={!newText.trim() || isChecking}
        >
          <Text style={styles.addButtonText}>{todoList.addButton}</Text>
        </TouchableOpacity>
      </View>

      {/* Main list: FlatList handles virtualization and performance. The
          child `TodoItem` components receive `onRequestAuth` so they can
          ask the parent to authenticate before mutating. */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        windowSize={11}
        removeClippedSubviews={true}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

export const TodoList = React.memo(TodoListComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textDim,
    marginBottom: theme.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primaryAccent,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  empty: {
    fontSize: 16,
    color: theme.colors.textDim,
    textAlign: 'center',
    marginTop: theme.spacing.lg * 2,
  },
});
