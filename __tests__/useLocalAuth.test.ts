/**
 * Unit tests for useLocalAuth hook (with mocked expo-local-authentication).
 * Verifies success/error handling and that authenticate returns correct shape.
 */
import { renderHook, act } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalAuth } from '../src/hooks/useLocalAuth';

jest.mock('expo-local-authentication');

describe('useLocalAuth', () => {
  beforeEach(() => {
    jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
    jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
  });

  it('authenticate returns success when native auth succeeds', async () => {
    jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: true,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useLocalAuth());

    let authResult: { success: boolean; error?: string } | null = null;
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult).toEqual({ success: true });
  });

  it('authenticate returns error when device has no hardware', async () => {
    jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);

    const { result } = renderHook(() => useLocalAuth());

    let authResult: { success: boolean; error?: string } | null = null;
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult?.success).toBe(false);
    expect(authResult?.error).toContain('does not support');
  });

  it('authenticate returns error when user cancels', async () => {
    jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    } as any);

    const { result } = renderHook(() => useLocalAuth());

    let authResult: { success: boolean; error?: string } | null = null;
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult?.success).toBe(false);
    expect(authResult?.error).toBeDefined();
  });
});
