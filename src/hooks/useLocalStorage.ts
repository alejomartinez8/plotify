import { useEffect, useState } from "react";

export function useLocalStorage<T extends string>(
  key: string,
  defaultValue: T,
  isValid: (value: string) => value is T
) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored !== null && isValid(stored)) {
      setValue(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setPersistedValue = (next: T) => {
    setValue(next);
    window.localStorage.setItem(key, next);
  };

  return [value, setPersistedValue] as const;
}
