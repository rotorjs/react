import { useContext } from 'react';
import { DashboardContext } from './DashboardContext';

export function useDashboardContext() {
  return useContext(DashboardContext);
}
