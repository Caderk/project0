// @components/inventory/ItemForm.tsx
'use client';

import { useState } from 'react';
import styles from '@styles/inventory/Inventory.module.css';
import Form from 'next/form'

interface ItemFormProps {
  onAddItem: (name: string) => void;
  isDisabled: boolean;
}

export default function ItemForm({ onAddItem, isDisabled }: ItemFormProps) {
  const [newItemName, setNewItemName] = useState('');

  const handleSubmit = () => {
    if (newItemName.trim() === '') return;
    onAddItem(newItemName);
    setNewItemName('');
  };

  return (
    <Form className={styles.form} action={handleSubmit}>
      {isDisabled ? (
        <span style={{ color: 'red' }}>Item limit reached. Cannot add more items.</span>
      ) : (
        <>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            disabled={isDisabled}
          />
          <button type="submit" disabled={isDisabled}>
            Add Item
          </button>
        </>
      )}
    </Form>
  );
}