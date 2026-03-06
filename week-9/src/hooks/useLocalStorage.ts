/**
 * A custom hook for synchronizing a state variable with localStorage. It abstracts away the logic of reading from and writing to localStorage, providing a simple interface for components to use.
 * The hook takes a key and an initial value as arguments. It initializes the state by trying to read the value from localStorage (and parsing it from JSON), 
 * falling back to the provided initial value if the key doesn't exist or if there's an error during parsing.
 * 
 * Whenever the state value changes, the hook updates localStorage by stringifying the new value and saving it under the specified key. 
 * This ensures that the state is persisted across page reloads and can be shared between different components that use the same key.
 * 
 * By using this hook, components can easily manage persistent state without having to deal with the details of localStorage directly, leading to cleaner and more maintainable code.
*/

import { useEffect, useState } from "react";

// The return type is matching the useState signature, meaning that the function can return any value that useState can return, and the setter function can accept any value or function that useState's setter can accept.
// Basically this enables the possibility for localStorage to preserve any kind of state of a serializable type of data.
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {       
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}