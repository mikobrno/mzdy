import React from 'react';

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md">
        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md">
          Zavřít
        </button>
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md">
    {children}
  </button>
);

const DialogContent = ({ children }) => (
  <div className="p-4 bg-gray-100 rounded-md">{children}</div>
);

const DialogHeader = ({ title }) => (
  <h2 className="text-lg font-bold mb-2">{title}</h2>
);

const DialogTitle = ({ children }) => (
  <h3 className="text-md font-semibold">{children}</h3>
);

const DialogFooter = ({ children }) => (
  <div className="mt-4 flex justify-end">{children}</div>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter };
