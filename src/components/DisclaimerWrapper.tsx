"use client";

import { useState, useEffect } from "react";
import DisclaimerModal from "@/components/DisclaimerModal";

const DisclaimerWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("disclaimerAccepted");
    setHasAccepted(accepted === "true");
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setHasAccepted(true);
  };

  if (hasAccepted === null) {
    // Prevents flickering by not showing anything while checking localStorage
    return null;
  }

  return (
    <>
      {!hasAccepted ? <DisclaimerModal onAccept={handleAccept} /> : children}
    </>
  );
};

export default DisclaimerWrapper;
