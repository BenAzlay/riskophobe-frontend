"use client";

import useStore from "@/store/useStore";
import TransactionButton from "./TransactionButton";

const SignInButton = () => {
  const { setWalletDialogOpen } = useStore();

  return (
    <TransactionButton onClickAction={() => setWalletDialogOpen(true)}>
      SIGN IN
    </TransactionButton>
  );
};

export default SignInButton;
