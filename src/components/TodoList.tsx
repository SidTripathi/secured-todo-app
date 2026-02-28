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
import type { TodoItem as TodoItemType } from '../types/todo';

const ITEM_HEIGHT = 56;

/**
 * Main TODO list UI: input to add items, list of TodoItem.
 * Add/update/delete are gated: we run authenticate() first, then perform the action.
 */
function TodoListComponent() {
  const { items, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodo();
  const { authenticate, isChecking } = useLocalAuth();
  const [newText, setNewText] = useState('');

  const handleRequestAuth = useCallback(
    async (action: () => void) => {
      const result = await authenticate(todoList.authPromptModify);
      if (result.success) {
        action();
      }
    },
    [authenticate]
  );

  const handleAdd = useCallback(async () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    await handleRequestAuth(() => {
      addTodo(trimmed);
      setNewText('');
    });
  }, [newText, handleRequestAuth, addTodo]);

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

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const listEmptyComponent = useMemo(
    () => <Text style={styles.empty}>{todoList.emptyList}</Text>,
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{app.title}</Text>
      <Text style={styles.subtitle}>{todoList.subtitle}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={todoList.inputPlaceholder}
          placeholderTextColor="rgba(255,255,255,0.5)"
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#bb28a1',
    paddingHorizontal: 20,
    borderRadius: 10,
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 40,
  },
});
