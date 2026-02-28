import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { TodoList } from './TodoList';
import { app, authGate } from '../utils/strings';

/**
 * Wraps the TODO list and shows an auth screen until the user authenticates.
 * After successful auth, we show the TodoList. We do not lock again on app background
 * in this minimal version (could be extended with AppState).
 */
function AuthGateComponent() {
  const { authenticate, hasHardware, isEnrolled, isChecking } = useLocalAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState<string>(authGate.loading);
  const [loading, setLoading] = useState(true);
  const [canUnlock, setCanUnlock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hw = await hasHardware();
      const enrolled = await isEnrolled();
      if (cancelled) return;
      if (!hw) {
        setMessage(authGate.noHardware);
        setLoading(false);
        return;
      }
      if (!enrolled) {
        setMessage(authGate.notEnrolled);
        setCanUnlock(false);
        setLoading(false);
        return;
      }
      setMessage(authGate.tapToUnlock);
      setCanUnlock(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHardware, isEnrolled]);

  const handleUnlock = useCallback(async () => {
    const result = await authenticate(authGate.unlockPrompt);
    if (result.success) {
      setIsUnlocked(true);
    } else {
      setMessage(result.error ?? authGate.authFailed);
    }
  }, [authenticate]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  if (isUnlocked) {
    return <TodoList />;
  }

  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>{app.title}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#bb28a1" style={styles.spinner} />
      ) : (
        <>
          <Text style={styles.gateMessage}>{message}</Text>
          {!canUnlock && message === authGate.notEnrolled && (
            <Text style={styles.gateHint}>{authGate.notEnrolledHint}</Text>
          )}
          <TouchableOpacity
            onPress={handleUnlock}
            style={[styles.unlockButton, isChecking && styles.unlockButtonDisabled]}
            disabled={isChecking}
            activeOpacity={0.7}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.unlockHint}>{authGate.unlockButton}</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#8b3ac1',
    padding: 24,
  },
  gateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  gateMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  gateHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  unlockHint: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  unlockButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#bb28a1',
    borderRadius: 12,
    marginBottom: 12,
  },
  settingsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  unlockButtonDisabled: {
    opacity: 0.8,
  },
  spinner: {
    marginTop: 16,
  },
});
