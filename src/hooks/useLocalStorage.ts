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
      // Reading localStorage during render would mismatch the server-rendered
      // default, so the client-only value is adopted after mount instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
