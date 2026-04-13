import { useCallback, useRef, useEffect } from 'react';


export const Debounce = (callback, delay:number) => {
    const timeoutRef = useRef(null);

    // Clear timeout on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const debouncedFunction = useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedFunction;
};