import { useContext, type ComponentType, type PropsWithChildren } from 'react';
import { DashboardContext } from './DashboardContext';
import { DashboardError } from './DashboardError';
import type { ErrorDashboardNode } from '@rotorjs/dashboards';
import { getKey } from './getKey';
import { DashboardLayoutContext } from './DashboardLayoutContext';

const context = { type: 'error' };

export function DashboardLayoutError({
  id,
  error,
  children,
}: PropsWithChildren<{
  type?: 'error';
  id?: string;
  error: unknown;
}>) {
  const { layouts } = useContext(DashboardContext);

  const Error = (layouts.error ?? DashboardError) as ComponentType<
    PropsWithChildren<ErrorDashboardNode>
  >;

  const errorNode = { type: 'error' as const, id, error };

  return (
    <DashboardLayoutContext.Provider value={context}>
      <Error {...errorNode} key={getKey(errorNode)}>
        {children}
      </Error>
    </DashboardLayoutContext.Provider>
  );
}
