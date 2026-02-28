/**
 * Centralized strings for the app.
 * Use these constants instead of hardcoding text so we can update or localize in one place.
 */

/** App-wide title and branding */
export const app = {
  title: 'Secured TODO',
} as const;

/** Auth gate (unlock) screen */
export const authGate = {
  loading: 'Loading...',
  noHardware: 'This device does not support biometric authentication.',
  notEnrolled: 'No biometric or device credentials are set up on this device.',
  notEnrolledHint: 'If you already set a screen lock, tap Unlock and enter your PIN.',
  tapToUnlock: 'Tap to unlock your TODO list',
  unlockPrompt: 'Unlock your TODO list',
  unlockButton: 'Unlock',
  authFailed: 'Authentication failed. Try again.',
} as const;

/** TODO list screen */
export const todoList = {
  subtitle: 'Authenticate to add, edit, or delete items',
  inputPlaceholder: 'New task...',
  addButton: 'Add',
  emptyList: 'No tasks yet. Add one above (auth required).',
  authPromptModify: 'Authenticate to modify your TODO list',
} as const;

/** Single TODO item row (buttons, edit mode) */
export const todoItem = {
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
} as const;

/** Authentication hook – prompts and error messages */
export const auth = {
  defaultPrompt: 'Authenticate to access your TODO list',
  fallbackLabel: 'Use password or PIN',
  errorNoHardware: 'This device does not support biometric authentication.',
  errorNotEnrolled: 'No biometric or device credentials are set up on this device.',
  errorCancelled: 'Authentication was cancelled.',
  errorFallback: 'Fallback selected.',
  errorFailed: 'Authentication failed.',
  errorGeneric: 'Authentication error',
} as const;
