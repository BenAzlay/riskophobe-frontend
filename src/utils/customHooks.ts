import { useEffect, useRef, useState } from "react";
import { getCurrentTimestampSeconds } from "./utilFunc";

/**
 * Custom useEffect hook that ensures only the async call result from the latest dependencies is set.
 */
export const useAsyncEffect = <T>(
  asyncGetterMethod: (signal?: AbortSignal) => Promise<T>,
  setterMethod: (value: T) => void,
  dependencies: unknown[],
  options: {
    onError?: (error: unknown) => void; // Callback for error handling
    skipInitialCall?: boolean; // Option to skip the initial fetch
  } = {}
): void => {
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const callback = async () => {
      try {
        const payload = await asyncGetterMethod(controller.signal);
        if (!isCancelled) {
          setterMethod(payload);
        }
      } catch (error) {
        if (!isCancelled && options.onError) {
          options.onError(error);
        }
      }
    };

    if (!options.skipInitialCall) {
      callback();
    }

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, dependencies); // Note: Memoize asyncGetterMethod and setterMethod with useCallback for optimal performance.
};

/**
 * Custom useEffect hook that runs an async operation only when the page is visible.
 * Triggers when the page becomes visible again after being hidden.
 * @template T - The type of the data returned by the async method.
 * @param asyncGetterMethod - A function returning a Promise, optionally accepting an AbortSignal.
 * @param setterMethod - A callback to set the fetched data.
 * @param dependencies - Dependency array to trigger the effect.
 * @param options - Configuration for error handling and initial fetch.
 */
export const useVisibilityEffect = <T>(
  asyncGetterMethod: (signal?: AbortSignal) => Promise<T>,
  setterMethod: (value: T) => void,
  dependencies: unknown[],
  options: {
    onError?: (error: unknown) => void;
    skipInitialCall?: boolean;
  } = {}
): void => {
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const payload = await asyncGetterMethod(controller.signal);
        if (!isCancelled) {
          setterMethod(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          if (options.onError) {
            options.onError(error);
          } else if (process.env.NODE_ENV !== "production") {
            console.error("Unhandled error in useVisibilityEffect:", error);
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        isCancelled = true;
        controller.abort(); // Cancel any in-flight request
      } else {
        isCancelled = false;
        fetchData(); // Trigger fetch when visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!options.skipInitialCall && document.visibilityState === "visible") {
      fetchData(); // Initial request only if visible
    }

    return () => {
      isCancelled = true;
      controller.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, dependencies); // Note: Memoize asyncGetterMethod and setterMethod with useCallback for optimal performance.
};

/**
 * Custom useEffect hook that will not trigger if the page is out of focus.
 * Triggers when the page is focused again and also triggers on a set interval.
 */
export const useVisibilityIntervalEffect = (
  callback: (signal?: AbortSignal) => void,
  intervalSeconds: number,
  dependencies: unknown[]
): void => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const controller = new AbortController();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearInterval(intervalId); // Page is out of focus, stop making backend calls
      } else {
        callback(controller.signal); // Initial request
        intervalId = setInterval(callback, intervalSeconds * 1000); // Restart interval
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    callback(controller.signal); // Initial request
    intervalId = setInterval(callback, intervalSeconds * 1000);

    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId); // Cleanup interval on unmount
    };
  }, dependencies);
};

/**
 * Hook to get the previous value of any state or prop.
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value; // Store the current value in ref
  }, [value]); // Update the ref when the value changes

  return ref.current; // Return the previous value
};

/**
 * Hook to return the current timestamp in seconds, updated every second.
 */
export const useCurrentTimestamp = (): number => {
  const [currentTs, setCurrentTs] = useState<number>(
    getCurrentTimestampSeconds()
  ); // Initialize with the current timestamp

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTs(getCurrentTimestampSeconds()); // Update timestamp every second
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return currentTs;
};
