import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { nhost } from '../src/lib/nhost';
import '@testing-library/jest-dom';

// Ensure React is properly initialized in the test environment
if (typeof React.useState !== 'function') {
  throw new Error('React.useState is not properly initialized. Ensure React is correctly imported and the test environment supports React.');
}

// Mock component for testing CRUD operations
const MockCRUDComponent = ({ onSave, onDelete }) => {
  const [value, setValue] = React.useState('');

  return (
    <div>
      <input
        data-testid="input-field"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <button data-testid="save-button" onClick={() => onSave(value)}>
        Save
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
};

describe('CRUD Operations', () => {
  it('should save data correctly', async () => {
    const mockSave = jest.fn(async (data) => {
      await nhost.graphql.request(`
        mutation InsertData {
          insert_test_table(objects: { value: "${data}" }) {
            affected_rows
          }
        }
      `);
    });

    render(<MockCRUDComponent onSave={mockSave} onDelete={() => {}} />);

    const input = screen.getByTestId('input-field');
    const saveButton = screen.getByTestId('save-button');

    fireEvent.change(input, { target: { value: 'Test Value' } });
    fireEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalledWith('Test Value');
  });

  it('should delete data correctly', async () => {
    const mockDelete = jest.fn(async () => {
      await nhost.graphql.request(`
        mutation DeleteData {
          delete_test_table(where: { id: { _eq: 1 } }) {
            affected_rows
          }
        }
      `);
    });

    render(<MockCRUDComponent onSave={() => {}} onDelete={mockDelete} />);

    const deleteButton = screen.getByTestId('delete-button');

    fireEvent.click(deleteButton);

    expect(mockDelete).toHaveBeenCalled();
  });
});
