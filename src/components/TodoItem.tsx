import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { TodoItem as TodoItemType } from '../types/todo';
import { todoItem } from '../utils/strings';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onRequestAuth: (action: () => void) => void;
}

/**
 * Single TODO row: text, completed state, edit/delete.
 * Mutations (toggle, update, delete) require auth; onRequestAuth triggers auth then runs the action.
 */
function TodoItemComponent({ item, onToggle, onUpdate, onDelete, onRequestAuth }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleToggle = useCallback(() => {
    onRequestAuth(() => onToggle(item.id));
  }, [item.id, onRequestAuth, onToggle]);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onRequestAuth(() => onUpdate(item.id, trimmed));
    }
    setEditText(item.text);
    setIsEditing(false);
  }, [editText, item.id, item.text, onRequestAuth, onUpdate]);

  const handleDelete = useCallback(() => {
    onRequestAuth(() => onDelete(item.id));
  }, [item.id, onRequestAuth, onDelete]);

  const handleStartEdit = useCallback(() => setIsEditing(true), []);

  if (isEditing) {
    return (
      <View style={styles.row}>
        <TextInput
          style={styles.editInput}
          onEndEditing={handleSaveEdit}
          onChangeText={setEditText}
          value={editText}
          editable
          autoFocus
        />
        <TouchableOpacity onPress={handleSaveEdit} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>{todoItem.save}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text
        style={[styles.text, item.completed && styles.textCompleted]}
        numberOfLines={2}
      >
        {item.text}
      </Text>
      <TouchableOpacity onPress={handleStartEdit} style={styles.iconButton}>
        <Text style={styles.iconText}>{todoItem.edit}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteButton]}>
        <Text style={styles.iconText}>{todoItem.delete}</Text>
      </TouchableOpacity>
    </View>
  );
}

export const TodoItem = React.memo(TodoItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#bb28a1',
    borderColor: '#bb28a1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.6)',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  iconButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#bb28a1',
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#bb28a1',
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
