interface TransactionButtonProps {
  onClickAction: () => void;
  children: React.ReactNode; // Content passed as children
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
}

const TransactionButton = ({
  onClickAction,
  children,
  disabled = false,
  loading = false,
  errorMessage = null,
}: TransactionButtonProps) => {
  return (
    <div className="space-y-2 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={onClickAction}
        className="btn btn-primary w-full"
      >
        {loading ? <span className="loading loading-spinner"></span> : null}
        {children}
      </button>
      {!!errorMessage ? (
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>

          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};

export default TransactionButton;
