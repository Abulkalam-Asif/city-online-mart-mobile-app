import { useCallback, useRef } from "react";

/**
 * Hook for preventing multiple presses
 * @param delay - Delay in milliseconds
 * @returns Function to check if press is allowed
 */
export function useSinglePress(delay = 1000) {
  const lastPress = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastPress.current < delay) return false;
    lastPress.current = now;
    return true;
  }, [delay]);
}
