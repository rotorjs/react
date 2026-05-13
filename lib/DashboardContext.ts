import type {
  DashboardEventTarget,
  DashboardFact,
  DashboardVar,
} from '@rotorjs/dashboards';
import { createContext } from 'react';
import type {
  DashboardLayoutMap,
  DashboardLayoutNode,
} from './DashboardLayoutNode';
import type { DashboardTileMap } from './DashboardTileNode';

export type DashboardContextValue = {
  engine: DashboardEventTarget;
  vars: { [name: string]: DashboardVar };
  facts: { [name: string]: DashboardFact };
  layouts: DashboardLayoutMap;
  defaultLayout?: DashboardLayoutNode;
  tiles: DashboardTileMap;
};

export const DashboardContext = createContext<DashboardContextValue>(
  undefined as unknown as DashboardContextValue,
);
