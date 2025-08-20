import React from 'react';

const Select = ({ options, value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border rounded-md"
      title="Vyberte možnost"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const SelectTrigger = ({ children, onClick }) => (
  <button onClick={onClick} className="px-4 py-2 bg-green-500 text-white rounded-md">
    {children}
  </button>
);

const SelectContent = ({ children }) => (
  <div className="p-4 bg-gray-50 rounded-md">{children}</div>
);

const SelectItem = ({ value, children, onClick }) => (
  <div onClick={() => onClick(value)} className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
    {children}
  </div>
);

export { Select, SelectTrigger, SelectContent, SelectItem };
