// app/components/ItemRow.tsx
'use client';

import { useState } from 'react';
import styles from '../../styles/inventory/Inventory.module.css';

interface Item {
  id: number;
  name: string;
}

interface ItemRowProps {
  item: Item;
  onEditItem: (id: number, name: string) => void;
  onDeleteItem: (id: number) => void;
}

export default function ItemRow({ item, onEditItem, onDeleteItem }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(item.name);

  const handleSave = () => {
    if (editingName.trim() === '') return;
    onEditItem(item.id, editingName);
    setIsEditing(false);
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
          item.name
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
          <button onClick={() => onDeleteItem(item.id)}>Delete</button>
        )}
      </td>
    </tr>
  );
}
