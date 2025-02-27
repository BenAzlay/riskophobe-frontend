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
  }, dependencies);
};

/**
 * Same functionality as useAsyncEffect, but will not trigger if the page is out of focus.
 * Triggers when the page is focused again.
 */
export const useVisibilityEffect = <T>(
  asyncGetterMethod: () => Promise<T>,
  setterMethod: (value: T) => void,
  dependencies: unknown[]
): void => {
  useEffect(() => {
    let isCancelled = false;

    const callback = async () => {
      const payload = await asyncGetterMethod();
      if (!isCancelled) {
        setterMethod(payload);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        isCancelled = true; // Stop making the request if the app is out of focus
      } else {
        isCancelled = false; // Resume making the request when the app is in focus
        if (!isCancelled && document.visibilityState === "visible") {
          callback();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (document.visibilityState === "visible") {
      callback(); // Initial request
    }

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, dependencies);
};

/**
 * Custom useEffect hook that will not trigger if the page is out of focus.
 * Triggers when the page is focused again and also triggers on a set interval.
 */
export const useVisibilityIntervalEffect = (
  callback: () => void,
  intervalSeconds: number,
  dependencies: unknown[]
): void => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearInterval(intervalId); // Page is out of focus, stop making backend calls
      } else {
        callback(); // Initial request
        intervalId = setInterval(callback, intervalSeconds * 1000); // Restart interval
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    callback(); // Initial request
    intervalId = setInterval(callback, intervalSeconds * 1000);

    return () => {
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
