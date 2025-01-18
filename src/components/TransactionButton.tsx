import { FC } from "react";

interface TransactionButtonProps {
  onClickAction: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode; // Content passed as children
}

const TransactionButton: FC<TransactionButtonProps> = ({
  onClickAction,
  children,
  disabled = false,
  loading = false,
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
