import React, { useRef, useEffect } from "react";

interface ModalProps {
  title?: string; // Optional title
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Function to handle closing
  children: React.ReactNode; // Content passed as children
}

const Modal: React.FC<ModalProps> = ({ title, visible, onClose, children }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!modalRef.current) return;
    visible ? modalRef.current.showModal() : modalRef.current.close();
  }, [visible]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box overflow-visible">
        {title && <h3 className="font-bold text-lg">{title}</h3>}
        <div className="py-4">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => handleClose()}>close</button>
      </form>
    </dialog>
  );
};

export default Modal;
