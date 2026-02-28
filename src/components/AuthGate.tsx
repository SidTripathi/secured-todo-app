import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { TodoList } from './TodoList';
import { app, authGate } from '../utils/strings';
import { theme } from '../shared/theme';

/**
 * AuthGateComponent
 * - Shows a lock/auth screen while the app checks device auth capability.
 * - If the user successfully authenticates, renders the `TodoList`.
 * - Minimal behavior: it checks hardware and enrollment once on mount.
 */
function AuthGateComponent() {
  // Custom hook that exposes local authentication helpers:
  // - `authenticate(prompt)` triggers biometric/OS auth and returns a result
  // - `hasHardware()` checks for biometric hardware
  // - `isEnrolled()` checks if biometrics/credentials are enrolled
  // - `isChecking` indicates whether an auth attempt is in progress
  const { authenticate, hasHardware, isEnrolled, isChecking } = useLocalAuth();

  // Local UI state
  const [isUnlocked, setIsUnlocked] = useState(false); // whether auth succeeded
  const [message, setMessage] = useState<string>(authGate.loading); // status message shown to the user
  const [loading, setLoading] = useState(true); // while capability checks are running
  const [canUnlock, setCanUnlock] = useState(false); // whether unlock flow should be available

  // On mount: check device capability and enrollment state.
  // We mark a `cancelled` flag so stale async results don't update state after unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hw = await hasHardware();
      const enrolled = await isEnrolled();
      if (cancelled) return; // avoid setting state after unmount

      // If device lacks biometric/hardware features, show a helpful message.
      if (!hw) {
        setMessage(authGate.noHardware);
        setLoading(false);
        return;
      }

      // If device has hardware but nothing is enrolled (no biometrics/pin), prompt user.
      if (!enrolled) {
        setMessage(authGate.notEnrolled);
        setCanUnlock(false);
        setLoading(false);
        return;
      }

      // Device is ready for authentication: let the user tap to unlock.
      setMessage(authGate.tapToUnlock);
      setCanUnlock(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHardware, isEnrolled]);

  // Trigger authentication flow when user presses unlock.
  // `authenticate` returns an object with `success` and optional `error`.
  const handleUnlock = useCallback(async () => {
    const result = await authenticate(authGate.unlockPrompt);
    if (result.success) {
      // Unlock and render the `TodoList`.
      setIsUnlocked(true);
    } else {
      // Show the error or a generic failure message.
      setMessage(result.error ?? authGate.authFailed);
    }
  }, [authenticate]);

  // Open OS settings so the user can enroll biometrics or enable required permissions.
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // If already unlocked, render the main protected content.
  if (isUnlocked) {
    return <TodoList />;
  }

  // Render the authentication gate UI.
  // - While `loading` we show a spinner.
  // - Otherwise show status messages and controls.
  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>{app.title}</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryAccent} style={styles.spinner} />
      ) : (
        <>
          {/* Status message (e.g. "Tap to unlock", "No hardware", etc.) */}
          <Text style={styles.gateMessage}>{message}</Text>

          {/* If device is not enrolled, show a hint to enroll in system settings. */}
          {!canUnlock && message === authGate.notEnrolled && (
            <Text style={styles.gateHint}>{authGate.notEnrolledHint}</Text>
          )}

          {/* Unlock button: disabled while an auth attempt is running (`isChecking`). */}
          <TouchableOpacity
            onPress={handleUnlock}
            style={[styles.unlockButton, isChecking && styles.unlockButtonDisabled]}
            disabled={isChecking}
            activeOpacity={0.7}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <Text style={styles.unlockHint}>{authGate.unlockButton}</Text>
            )}
          </TouchableOpacity>

          {/* If unlock isn't available (no enrollment), offer a quick link to Settings. */}
          {!canUnlock && (
            <TouchableOpacity onPress={openSettings} style={styles.settingsButton} activeOpacity={0.7}>
              <Text style={styles.unlockHint}>Open Settings</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

export const AuthGate = React.memo(AuthGateComponent);

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
  },
  gateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  gateMessage: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  gateHint: {
    fontSize: 14,
    color: theme.colors.textDim,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  unlockHint: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '700',
  },
  unlockButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primaryAccent,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  settingsButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  unlockButtonDisabled: {
    opacity: 0.8,
  },
  spinner: {
    marginTop: theme.spacing.md,
  },
});
