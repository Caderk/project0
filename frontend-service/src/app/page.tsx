// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Item } from '../types/inventory';
import ItemForm from '../components/inventory/ItemForm';
import ItemList from '../components/inventory/ItemList';

import { addItem, editItem, deleteItem } from '../utils/api/inventory';

// Use addItem(name), editItem(id, name), deleteItem(id) in your handlers


export default function Page() {
  const [items, setItems] = useState<Item[]>([]);

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
  const handleAddItem = async (name: string) => {
    try {
      addItem(name)
      // SSE will update the items
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Handle editing an item
  const handleEditItem = async (id: number, name: string) => {
    try {
      editItem(id, name)
      // SSE will update the items
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: number) => {
    try {
      deleteItem(id)
      // SSE will update the items
    } catch (error) {
      console.error('Error deleting item:', error);
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

      <ItemForm onAddItem={handleAddItem} />
      <ItemList items={items} onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
    </div>
  );
}
