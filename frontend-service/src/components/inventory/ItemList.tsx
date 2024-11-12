// app/components/ItemList.tsx
'use client';

import { Item } from '../../types/inventory';
import ItemRow from './ItemRow';
import styles from '../styles/Inventory.module.css';

interface ItemListProps {
  items: Item[];
  onEditItem: (id: number, name: string) => void;
  onDeleteItem: (id: number) => void;
}

export default function ItemList({ items, onEditItem, onDeleteItem }: ItemListProps) {
  return (
    <table className={styles.table}>
      <tbody>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        ))}
      </tbody>
    </table>
  );
}
