import { useEffect, useRef, useState } from "react";

const specialCharacters: string[] = ["@", "#", "$", "%", "^", "&", "!", "?"];

const generateRandomString = (length: number): string[] => {
  return Array.from({ length }, () =>
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)]
  );
};

interface LoadingTextProps {
  speed?: number;
  length?: number;
  initialLength?: number;
}

const LoadingText: React.FC<LoadingTextProps> = ({ speed = 100, length = 4, initialLength = 1 }) => {
  const [isClient, setIsClient] = useState(false); // Track whether the component is mounted
  const displayLengthRef = useRef<number>(initialLength);
  const [displayText, setDisplayText] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true); // Mark the component as mounted
  }, []);

  useEffect(() => {
    if (!isClient) return; // Avoid running on the server

    let isMounted = true;

    const interval = setInterval(() => {
      if (isMounted) {
        const randomString = generateRandomString(displayLengthRef.current);
        setDisplayText(randomString);
        if (displayLengthRef.current < length) {
          displayLengthRef.current += 1;
        }
      }
    }, speed);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isClient, speed, length]);

  return <span>{isClient ? displayText.join("") : ""}</span>;
};

export default LoadingText;
