import React, { useEffect, useState } from 'react';


interface Props {
  initial?: boolean;
  delay?: number;
}
/**
 * A wrapper around `useState<boolean>`.
 * 
 * After update, resets to the `initial` value after `delay` ms.
 * 
 * Defaults: `initial = false`, `delay = 1000`.
 */
export const useResetBoolean = ({ initial = false, delay = 1000 }: Props = {}): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValue(initial);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value]);

  return [value, setValue]
}
