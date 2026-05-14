import { createContext, type ComponentType } from 'react';
import type { DashboardTileContainerProps } from './DashboardTileContainer';

export type DashboardLayoutContextValue = {
  type: string;
  tileContainer?: ComponentType<DashboardTileContainerProps>;
};

export const DashboardLayoutContext =
  createContext<DashboardLayoutContextValue>(
    undefined as unknown as DashboardLayoutContextValue,
  );
