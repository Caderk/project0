// @components/inventory/ItemForm.tsx
'use client';

import { useState } from 'react';
import styles from '../../styles/inventory/Inventory.module.css';

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
    <div className={styles.form}>
      {isDisabled ? (
        <p style={{ color: 'red' }}>Item limit reached. Cannot add more items.</p>
      ) : (
        <>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            disabled={isDisabled}
          />
          <button onClick={handleSubmit} disabled={isDisabled}>
            Add Item
          </button>
        </>
      )}
    </div>
  );
}
