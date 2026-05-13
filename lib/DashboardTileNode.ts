import type { DashboardNode } from '@rotorjs/dashboards';
import type { ComponentType } from 'react';

export type DashboardTileNode = DashboardNode;

export type DashboardTileMap = Record<string, ComponentType<DashboardTileNode>>;
