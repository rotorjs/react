import type {
  DashboardAction,
  DashboardEventTarget,
  DashboardFact,
  DashboardLayoutNode,
  DashboardTileNode,
  DashboardVar,
} from '@rotorjs/dashboard';
import {
  createContext,
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type DashboardLayoutMap = Record<
  string,
  ComponentType<PropsWithChildren<DashboardLayoutNode>>
>;

export type DashboardTileMap = Record<string, ComponentType<DashboardTileNode>>;

export type ApproveUserActionFunction = (action: DashboardAction) => boolean;

export type DashboardContextValue = {
  target: DashboardEventTarget;
  vars: { [name: string]: DashboardVar };
  facts: { [name: string]: DashboardFact };
  layouts: DashboardLayoutMap;
  defaultLayout?: DashboardLayoutNode;
  tiles: DashboardTileMap;
  approveUserAction: ApproveUserActionFunction;
};

export const DashboardContext = createContext<DashboardContextValue>(
  undefined as unknown as DashboardContextValue,
);
DashboardContext.displayName = 'DashboardContext';
