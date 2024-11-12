import {Item} from '@interfaces/inventory'

export async function addItem(name: string): Promise<Item> {
  const response = await fetch(`/inventory-service/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add item');
  }

  return response.json();
}

export async function editItem(id: string, name: string): Promise<Item> {
  const response = await fetch(`/inventory-service/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to edit item');
  }

  return response.json();
}

export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`/inventory-service/items/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete item');
  }
}