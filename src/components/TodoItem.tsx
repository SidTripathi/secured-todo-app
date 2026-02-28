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
import { theme } from '../shared/theme';

interface TodoItemProps {
  // The todo item data to render
  item: TodoItemType;
  // Callbacks provided by the parent to mutate state; wrapped with auth.
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  // Receives an action that requires authentication. The parent should
  // trigger auth and run `action()` only when auth succeeds.
  onRequestAuth: (action: () => void) => void;
}

/**
 * TodoItemComponent
 * - Renders a single todo row with check, text, edit and delete controls.
 * - All mutating actions are routed through `onRequestAuth` so the parent
 *   can enforce local authentication before performing the change.
 */
function TodoItemComponent({ item, onToggle, onUpdate, onDelete, onRequestAuth }: TodoItemProps) {
  // Whether we're in edit-mode for this row
  const [isEditing, setIsEditing] = useState(false);
  // Current text while editing (local, not applied until save)
  const [editText, setEditText] = useState(item.text);

  // Toggle completion: wrapped in `onRequestAuth` so the parent handles auth.
  const handleToggle = useCallback(() => {
    onRequestAuth(() => onToggle(item.id));
  }, [item.id, onRequestAuth, onToggle]);

  // Save the edited text. We trim and only call update if the text changed.
  // The actual update is performed only after a successful auth via `onRequestAuth`.
  const handleSaveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onRequestAuth(() => onUpdate(item.id, trimmed));
    }
    // Reset local editing state to reflect current (possibly unchanged) item text
    setEditText(item.text);
    setIsEditing(false);
  }, [editText, item.id, item.text, onRequestAuth, onUpdate]);

  // Delete the item, routed through auth as well.
  const handleDelete = useCallback(() => {
    onRequestAuth(() => onDelete(item.id));
  }, [item.id, onRequestAuth, onDelete]);

  // Enter edit mode
  const handleStartEdit = useCallback(() => setIsEditing(true), []);

  // If editing, show an inline TextInput and a save button.
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

  // Default (non-edit) row:
  // - checkbox: toggle completion
  // - text: shows item text, truncated to 2 lines
  // - edit/delete buttons
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: theme.spacing.xl,
    height: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primaryAccent,
    borderColor: theme.colors.primaryAccent,
  },
  checkmark: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.6)',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  iconButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: theme.colors.primaryAccent,
  },
  iconText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primaryAccent,
    borderRadius: theme.borderRadius.sm,
  },
  smallButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
