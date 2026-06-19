import type { ErrorDashboardTileNode } from '@rotorjs/dashboard';
import { type ComponentType } from 'react';
import { DashboardError } from './DashboardError';
import { getNodeKey } from './getNodeKey';
import { useDashboardContext } from './useDashboardContext';

export function DashboardTileError({
  id,
  error,
}: {
  type?: 'error';
  id?: string;
  error: unknown;
}) {
  const { tiles } = useDashboardContext();

  const Error = (tiles.error ??
    DashboardError) as ComponentType<ErrorDashboardTileNode>;

  const errorNode = { type: 'error' as const, id, error };

  return <Error {...errorNode} key={getNodeKey(errorNode)} />;
}
DashboardTileError.displayName = 'DashboardTileError';
