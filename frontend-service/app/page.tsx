'use client';

import { useState, useEffect } from 'react';
import styles from './my-style.module.css'

interface Item {
  id: number;
  name: string;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemName, setEditingItemName] = useState('');

  useEffect(() => {
    // Fetch initial items list
    fetch(`/inventory-service/items`)
      .then((response) => response.json())
      .then((data) => setItems(data));

    // Set up SSE connection
    const eventSource = new EventSource(`/inventory-service/items/stream`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setItems(data);
    };

    eventSource.onerror = () => {
      console.error('EventSource failed.');
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  // Handle adding a new item
  const handleAddItem = async () => {
    if (newItemName.trim() === '') return;

    try {
      await fetch(`/inventory-service/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newItemName })
      });
      setNewItemName('');
      // No need to update items manually; SSE will handle it
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: number) => {
    try {
      await fetch(`/inventory-service/items/${id}`, {
        method: 'DELETE'
      });
      // No need to update items manually; SSE will handle it
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Handle starting the edit process
  const handleEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  // Handle saving the edited item
  const handleSaveItem = async () => {
    if (editingItemName.trim() === '') return;

    try {
      await fetch(`/inventory-service/items/${editingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editingItemName })
      });
      setEditingItemId(null);
      setEditingItemName('');
      // No need to update items manually; SSE will handle it
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Handle cancelling the edit
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName('');
  };

  return (
    <div className={styles.inventory} style={{ padding: '20px' }}>
      <h1>Real-Time Items List</h1>

      {/* Add New Item */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Enter item name"
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>

      {/* Items List */}
      <table className={styles.table}>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {editingItemId === item.id ? (
                <>
                  <td className={styles.td}>
                    <input
                      className={styles.td}
                      type="text"
                      value={editingItemName}
                      onChange={(e) => setEditingItemName(e.target.value)}
                    />
                  </td>
                  <td className={styles.td}>
                    <button onClick={handleSaveItem}>Save</button>
                  </td>
                  <td className={styles.td}>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className={styles.td}>{item.name}</td>
                  <td className={styles.td}>
                    <button onClick={() => handleEditItem(item)}>Edit</button>
                  </td>
                  <td className={styles.td}>
                    <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
}