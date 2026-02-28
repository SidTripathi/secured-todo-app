import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { TodoProvider } from '@/context/TodoContext';
import { AuthGate } from '@/components/AuthGate';
import { theme } from '@/shared/theme';

/**
 * Entry point: wrap app in TodoProvider for state, then show AuthGate.
 * AuthGate asks for local auth before revealing the TODO list; add/update/delete also require auth.
 */
export default function App() {
  return (
    <TodoProvider>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.primary }]}>
        <StatusBar style="light" />
        <AuthGate />
      </SafeAreaView>
    </TodoProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
