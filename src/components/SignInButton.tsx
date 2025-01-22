"use client";

import useStore from "@/store/useStore";
import React from "react";

const SignInButton: React.FC = () => {
  const { setWalletDialogOpen } = useStore();

  return (
    <button
      className="btn btn-primary w-full"
      onClick={() =>setWalletDialogOpen(true)}
    >
      SIGN IN
    </button>
  );
};

export default SignInButton;
