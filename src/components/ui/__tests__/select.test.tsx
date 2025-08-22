import React from 'react';
import { render } from '@testing-library/react';
import { Select } from '../select';

test('renders Select component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  const { getByTitle } = render(
    <Select options={options} value="option1" onChange={() => {}} />
  );

  expect(getByTitle('Vyberte možnost')).toBeInTheDocument();
});
