import React from "react";

interface ModalProps {
  title?: string; // Optional title
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Function to handle closing
  children: React.ReactNode; // Content passed as children
}

const Modal = ({ title, visible, onClose, children }: ModalProps) => {
  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose(); // Close when backdrop is clicked
    }
  };

  return (
    <>
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div className="bg-[#1e1e1e] text-white rounded-xl shadow-lg p-6 max-w-lg w-full">
            {/* Modal Header */}
            {title && (
              <h3 className="text-lg font-semibold text-center mb-4 border-b border-[#2d2d2d] pb-2">
                {title}
              </h3>
            )}
            {/* Modal Body */}
            <div className="space-y-4">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
