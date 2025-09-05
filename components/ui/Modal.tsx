'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    'sm': 'max-w-sm md:max-w-md',
    'md': 'max-w-md md:max-w-lg',
    'lg': 'max-w-lg md:max-w-2xl',
    'xl': 'max-w-2xl md:max-w-4xl',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content w-full mx-4 ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-neutral-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <i className="ri-close-line text-lg md:text-xl"></i>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
