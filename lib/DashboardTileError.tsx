import type { ErrorDashboardTileNode } from '@rotorjs/dashboards';
import { useContext, type ComponentType } from 'react';
import { DashboardContext } from './DashboardContext';
import { DashboardError } from './DashboardError';
import { getKey } from './getKey';

export function DashboardTileError({
  id,
  error,
}: {
  type?: 'error';
  id?: string;
  error: unknown;
}) {
  const { tiles } = useContext(DashboardContext);

  const Error = (tiles.error ??
    DashboardError) as ComponentType<ErrorDashboardTileNode>;

  const errorNode = { type: 'error' as const, id, error };

  return <Error {...errorNode} key={getKey(errorNode)} />;
}
