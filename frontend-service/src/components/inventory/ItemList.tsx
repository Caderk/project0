'use client';

import { Item } from '@interfaces/inventory';
import ItemRow from '@components/inventory/ItemRow';
import styles from '@styles/inventory/Inventory.module.css';

interface ItemListProps {
  items: Item[];
  onEditItem: (id: string, name: string) => void;
  onDeleteItem: (id: string) => void;
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
