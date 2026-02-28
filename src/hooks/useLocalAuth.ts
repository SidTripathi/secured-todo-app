import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useState } from 'react';
import { auth } from '../utils/strings';

/**
 * Result of an authentication attempt.
 * success: true if user authenticated (biometric or device credential)
 * error: message when authentication failed or was unavailable
 */
export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Hook to interact with expo-local-authentication.
 * - hasHardware: device supports biometrics
 * - isEnrolled: user has set up at least one credential
 * - authenticate(): prompts for biometric/device auth, returns result
 */
export function useLocalAuth() {
  const [isChecking, setIsChecking] = useState(false);

  const hasHardware = useCallback(async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  }, []);

  const isEnrolled = useCallback(async (): Promise<boolean> => {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  }, []);

  const authenticate = useCallback(async (promptMessage?: string): Promise<AuthResult> => {
    setIsChecking(true);
    try {
      const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardwareSupport) {
        return { success: false, error: auth.errorNoHardware };
      }

      const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolledAsync) {
        return { success: false, error: auth.errorNotEnrolled };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage ?? auth.defaultPrompt,
        fallbackLabel: auth.fallbackLabel,
        disableDeviceFallback: false, // allow password/PIN as fallback to biometrics
      });

      if (result.success) {
        return { success: true };
      }

      const errorMessage =
        result.error === 'user_cancel'
          ? auth.errorCancelled
          : result.error === 'user_fallback'
            ? auth.errorFallback
            : auth.errorFailed;
      return { success: false, error: errorMessage };
    } catch (err) {
      const message = err instanceof Error ? err.message : auth.errorGeneric;
      return { success: false, error: message };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { authenticate, hasHardware, isEnrolled, isChecking };
}
