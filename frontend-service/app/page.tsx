'use client';

import { useState, useEffect } from 'react';

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
    <div style={{ padding: '20px' }}>
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
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {editingItemId === item.id ? (
              // Edit Mode
              <div>
                <input
                  type="text"
                  value={editingItemName}
                  onChange={(e) => setEditingItemName(e.target.value)}
                />
                <button onClick={handleSaveItem}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            ) : (
              // Display Mode
              <div>
                {item.name}{' '}
                <button onClick={() => handleEditItem(item)}>Edit</button>{' '}
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}