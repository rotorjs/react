import { useContext } from 'react';
import { DashboardLayoutContext } from './DashboardLayoutContext';

export function useDashboardLayoutContext() {
  return useContext(DashboardLayoutContext);
}
