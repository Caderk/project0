// @components/inventory/ItemRow.tsx
'use client';

import { useState } from 'react';
import styles from '@styles/inventory/Inventory.module.css';
import { Item } from '@interfaces/inventory';

interface ItemRowProps {
  item: Item;
  onEditItem: (id: string, name: string) => void;
  onDeleteItem: (id: string) => void;
}

export default function ItemRow({ item, onEditItem, onDeleteItem }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(item.name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (editingName.trim() === '') return;
    try {
      await onEditItem(item.id, editingName);
      setIsEditing(false);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error saving item:', error);
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteItem(item.id);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <tr>
      <td className={styles.td}>
        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
          />
        ) : (
          <span>{item.name}</span>
          
        )}
      </td>
      <td className={styles.td}>
        {isEditing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
      </td>
      <td className={styles.td}>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        ) : (
          <button onClick={handleDelete}>Delete</button>
        )}
      </td>
      {errorMessage && (
        <td className={styles.td} colSpan={3}>
          <span className='error-message'>{errorMessage}</span>
        </td>
      )}
    </tr>
  );
}
