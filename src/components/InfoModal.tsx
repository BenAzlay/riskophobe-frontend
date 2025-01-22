import React, { ReactNode } from "react";

type InfoModalProps = {
  children: ReactNode;
  title?: string;
};

const InfoModal: React.FC<InfoModalProps> = ({ children, title }) => {
  const modalId = "info_modal";

  return (
    <div className="inline-block">
      <button
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => document.getElementById(modalId)?.showModal()}
      >
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
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box space-y-2">
          {title ? <h3 className="font-bold text-lg">{title}</h3> : null}
          {children}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  );
};

export default InfoModal;
