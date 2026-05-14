import type { DashboardLayoutConfig } from '@rotorjs/dashboards';
import { useContext, type PropsWithChildren } from 'react';
import { DashboardLayoutContext } from './DashboardLayoutContext';

export type DashboardTileContainerProps = PropsWithChildren<{
  layout?: DashboardLayoutConfig;
}>;

export function DashboardTileContainer({
  layout,
  children,
}: DashboardTileContainerProps) {
  const { tileContainer: Container } = useContext(DashboardLayoutContext);

  if (!Container) return children;

  return <Container layout={layout}>{children}</Container>;
}
