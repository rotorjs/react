import type { ErrorDashboardLayoutNode } from '@rotorjs/dashboard';
import { type ComponentType, type PropsWithChildren } from 'react';
import { DashboardError } from './DashboardError';
import { DashboardLayoutContext } from './DashboardLayoutContext';
import { getNodeKey } from './getNodeKey';
import { useDashboardContext } from './useDashboardContext';

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
  const { layouts } = useDashboardContext();

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
DashboardLayoutError.displayName = 'DashboardLayoutError';
