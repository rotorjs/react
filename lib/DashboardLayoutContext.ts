import {
  createContext,
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type DashboardLayoutContextValue = {
  type: string;
  tileContainer?: ComponentType<PropsWithChildren>;
};

export const DashboardLayoutContext =
  createContext<DashboardLayoutContextValue>(
    undefined as unknown as DashboardLayoutContextValue,
  );
