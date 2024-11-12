// app/components/ItemForm.tsx
'use client';

import { useState } from 'react';
import styles from '../../styles/inventory/Inventory.module.css';

interface ItemFormProps {
  onAddItem: (name: string) => void;
}

export default function ItemForm({ onAddItem }: ItemFormProps) {
  const [newItemName, setNewItemName] = useState('');

  const handleSubmit = () => {
    if (newItemName.trim() === '') return;
    onAddItem(newItemName);
    setNewItemName('');
  };

  return (
    <div className={styles.form}>
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder="Enter item name"
      />
      <button onClick={handleSubmit}>Add Item</button>
    </div>
  );
}
