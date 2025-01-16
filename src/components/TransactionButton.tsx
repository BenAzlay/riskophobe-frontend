import { FC } from "react";

interface TransactionButtonProps {
  onClickAction: () => void;
  disabled: boolean;
  loading: boolean;
  children: React.ReactNode; // Content passed as children
}

const TransactionButton: FC<TransactionButtonProps> = ({
  onClickAction,
  disabled,
  loading,
  children
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClickAction}
      className="btn btn-primary w-full"
    >
      {loading ? <span className="loading loading-spinner"></span> : null}
      {children}
    </button>
  );
};

export default TransactionButton;
