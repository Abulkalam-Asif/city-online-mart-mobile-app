import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  modals: Modal[];
  showModal: (id: string, content: ReactNode) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  isModalVisible: (id: string) => boolean;
}

export interface Modal {
  id: string;
  content: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const showModal = (id: string, content: ReactNode) => {
    setModals(prev => {
      // Remove existing modal with same id, then add new one
      const filtered = prev.filter(modal => modal.id !== id);
      return [...filtered, { id, content }];
    });
  };

  const hideModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const hideAllModals = () => {
    setModals([]);
  };

  const isModalVisible = (id: string) => {
    return modals.some(modal => modal.id === id);
  };

  return (
    <ModalContext.Provider value={{
      modals,
      showModal,
      hideModal,
      hideAllModals,
      isModalVisible
    }}>
      {children}
    </ModalContext.Provider>
  );
};