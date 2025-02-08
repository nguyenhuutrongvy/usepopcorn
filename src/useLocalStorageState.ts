import { useEffect, useState } from "react";

const useLocalStorageState = <T>(initialState: T, key: string = "watched") => {
  const [value, setValue] = useState(
    () => JSON.parse(localStorage.getItem(key)!) ?? initialState
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
};

export default useLocalStorageState;
