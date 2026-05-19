import type { ErrorDashboardLayoutNode } from '@rotorjs/dashboard';
import { useContext, type ComponentType, type PropsWithChildren } from 'react';
import { DashboardContext } from './DashboardContext';
import { DashboardError } from './DashboardError';
import { DashboardLayoutContext } from './DashboardLayoutContext';
import { getNodeKey } from './getNodeKey';

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
    PropsWithChildren<ErrorDashboardLayoutNode>
  >;

  const errorNode = { type: 'error' as const, id, error };

  return (
    <DashboardLayoutContext.Provider value={context}>
      <Error {...errorNode} key={getNodeKey(errorNode)}>
        {children}
      </Error>
    </DashboardLayoutContext.Provider>
  );
}
