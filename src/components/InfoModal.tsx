import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";

type InfoModalProps = {
  children: ReactNode;
  title?: string;
};

const InfoModal: React.FC<InfoModalProps> = ({ children, title }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!modalRef.current) return;
    visible ? modalRef.current.showModal() : modalRef.current.close();
  }, [visible]);

  const modalId = "info_modal";

  return (
    <Fragment>
      <span className="inline-block">
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setVisible(true)}
          aria-label="InfoModal"
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
      </span>
      <dialog ref={modalRef} id={modalId} className="modal">
        <span className="modal-box space-y-2">
          {title ? <h3 className="font-bold text-lg">{title}</h3> : null}
          {children}
        </span>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setVisible(false)}>Close</button>
        </form>
      </dialog>
    </Fragment>
  );
};

export default InfoModal;
