import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-2 border rounded-md"
    />
  );
};

export { Input };
