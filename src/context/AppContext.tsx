import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserFlowState, TargetModule, LocationType } from '../types';

const initialState: UserFlowState = {
  targets: [],
  locationType: null,
  area: 100,
  usableArea: 70,
  city: '',
  gridConnected: true,
  gridStable: true,
  appliances: [],
  essentialAppliances: [],
  supportHours: 2,
  actualMonthlyKwh: null,
};

interface AppContextType {
  state: UserFlowState;
  updateState: (updates: Partial<UserFlowState>) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserFlowState>(initialState);

  const updateState = (updates: Partial<UserFlowState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => setState(initialState);

  return (
    <AppContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
