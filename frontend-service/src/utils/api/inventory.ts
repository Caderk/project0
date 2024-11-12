// app/utils/api.ts
export const addItem = async (name: string) => {
    await fetch(`/inventory-service/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  };
  
  export const editItem = async (id: number, name: string) => {
    await fetch(`/inventory-service/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  };
  
  export const deleteItem = async (id: number) => {
    await fetch(`/inventory-service/items/${id}`, {
      method: 'DELETE'
    });
  };
  