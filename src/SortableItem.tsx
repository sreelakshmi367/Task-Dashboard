import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: (props: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
  }) => React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <>{children({ attributes, listeners, setNodeRef, style })}</>;
};
