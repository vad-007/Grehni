
import React, { useState, useRef, useEffect } from 'react';
import type { Transaction } from '../types';
import { Icon } from './Icon';

interface TransactionItemProps {
  transaction: Transaction;
  onEditCategory: (transaction: Transaction) => void;
  isLast: boolean;
}

const SWIPE_THRESHOLD = -80; // pixels to swipe before action is revealed

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEditCategory, isLast }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
    if (itemRef.current) {
        itemRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startX.current;
    let newTranslateX = currentTranslateX.current + deltaX;
    // Limit swipe to the left, and not too far
    newTranslateX = Math.min(0, Math.max(newTranslateX, SWIPE_THRESHOLD * 1.5));
    setTranslateX(newTranslateX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (itemRef.current) {
      itemRef.current.style.transition = 'transform 0.2s ease-out';
    }

    if (translateX < SWIPE_THRESHOLD / 2) {
      setTranslateX(SWIPE_THRESHOLD);
      currentTranslateX.current = SWIPE_THRESHOLD;
    } else {
      setTranslateX(0);
      currentTranslateX.current = 0;
    }
  };
  
  // Reset on transaction change
  useEffect(() => {
    setTranslateX(0);
    currentTranslateX.current = 0;
  }, [transaction.id]);

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  const handleEditClick = () => {
    onEditCategory(transaction);
    // Animate back to original position
    setTimeout(() => {
        if(itemRef.current) itemRef.current.style.transition = 'transform 0.2s ease-out';
        setTranslateX(0);
        currentTranslateX.current = 0;
    }, 100);
  };

  const amountColor = transaction.amount >= 0 ? 'text-green-600' : 'text-gray-800';
  const amountSign = transaction.amount >= 0 ? '+' : '-';
  const formattedAmount = `${amountSign}$${Math.abs(transaction.amount).toFixed(2)}`;

  return (
    <div className="relative overflow-hidden">
        {/* Action Button */}
        <div className="absolute top-0 right-0 h-full flex items-center">
            <button onClick={handleEditClick} className="bg-indigo-500 text-white h-full px-5 flex flex-col items-center justify-center focus:outline-none">
                 <Icon name="Pencil" className="w-5 h-5" />
                 <span className="text-xs mt-1">Edit</span>
            </button>
        </div>
        
        {/* Swipable Item */}
        <div
          ref={itemRef}
          className={`bg-white w-full flex items-center p-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
          style={{ transform: `translateX(${translateX}px)`, touchAction: 'pan-y' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${transaction.category.color}`}>
            <Icon name={transaction.category.icon} className="w-5 h-5 text-white" />
          </div>
          <div className="ml-4 flex-grow overflow-hidden">
            <p className="font-semibold truncate">{transaction.description}</p>
            <p className="text-sm text-gray-500">{transaction.category.label}</p>
          </div>
          <div className={`ml-4 text-right font-semibold ${amountColor}`}>
            {formattedAmount}
          </div>
        </div>
    </div>
  );
};
