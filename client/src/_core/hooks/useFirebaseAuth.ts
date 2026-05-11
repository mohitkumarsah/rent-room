import { useFirebaseAuth as useFirebaseAuthContext } from "@/contexts/FirebaseAuthContext";

/**
 * Custom hook to use Firebase authentication
 * Provides access to current user, loading state, and auth methods
 */
export function useFirebaseAuth() {
  return useFirebaseAuthContext();
}
