import { useEffect, useState } from 'react'

/**
 * 
 * @param value generic. the value to debounce
 * @param delay optional. the delay after which, with no additional updates, the value should be changed
 * @returns  tuple containing: [the debounced value, boolean indicating whether an update is pending]
 */
export function useDebounce<T>(value: T, delay?: number): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isUpdating, setUpdating] = useState(false);

  useEffect(() => {
    setUpdating(true);
    const timer = setTimeout(() => {
      setUpdating(false);
      setDebouncedValue(value);
    }, delay ?? 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return [debouncedValue, isUpdating];
}
