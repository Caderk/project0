// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Item } from '@interfaces/inventory';
import ItemForm from '@components/inventory/ItemForm';
import ItemList from '@components/inventory/ItemList';

import { addItem, editItem, deleteItem } from '@utils/api/inventory';

// Use addItem(name), editItem(id, name), deleteItem(id) in your handlers

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial items list
    fetch(`/inventory-service/items`)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => {
        console.error('Error fetching items:', error);
        setErrorMessage('Failed to load items.');
      });

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
  const handleAddItem = async (name: string) => {
    try {
      await addItem(name);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error adding item:', error);
      setErrorMessage(error.message);
    }
  };

  // Handle editing an item
  const handleEditItem = async (id: string, name: string) => {
    try {
      await editItem(id, name);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error updating item:', error);
      setErrorMessage(error.message);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div>
      <h1>Welcome to my personal project site!</h1>
      <p>
        Currently, this page showcases a prototype of my inventory-service implementation. It&apos;s
        temporarily set up as the website&apos;s main content while I work on designing a dedicated
        homepage. Feel free to explore and interact with the service, or check out the API directly
        here: <a href="https://caderk.ddns.net/inventory-service">Inventory Service API</a>.
      </p>

      <h1>Real-Time Items List</h1>

      <div className="form-container">
        <ItemForm onAddItem={handleAddItem} isDisabled={items.length >= 20} />
        {errorMessage && <span className="error-message">{errorMessage}</span>}
      </div>
      <ItemList
        items={items}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
