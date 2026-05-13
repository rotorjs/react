import type { DashboardNode } from '@rotorjs/dashboards';
import type { ComponentType, PropsWithChildren } from 'react';

export type DashboardLayoutNode = DashboardNode;

export type DashboardLayoutMap = Record<
  string,
  ComponentType<PropsWithChildren<DashboardLayoutNode>>
>;
