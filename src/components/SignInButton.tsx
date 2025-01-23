"use client";

import useStore from "@/store/useStore";
import React from "react";
import TransactionButton from "./TransactionButton";

const SignInButton: React.FC = () => {
  const { setWalletDialogOpen } = useStore();

  return (
    <TransactionButton onClickAction={() => setWalletDialogOpen(true)}>
      SIGN IN
    </TransactionButton>
  );
};

export default SignInButton;
