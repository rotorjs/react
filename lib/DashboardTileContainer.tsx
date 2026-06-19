import type { DashboardLayoutConfig } from '@rotorjs/dashboard';
import { type CSSProperties, type ReactNode } from 'react';
import { useDashboardLayoutContext } from './useDashboardLayoutContext';

export type DashboardTileContainerProps = {
  layout?: DashboardLayoutConfig;
  children: (layoutProps: {
    className?: string;
    style?: CSSProperties;
  }) => ReactNode;
};

export function DashboardTileContainer({
  layout,
  children,
}: DashboardTileContainerProps) {
  const { tileContainer: Container } = useDashboardLayoutContext();

  if (!Container) return children({});

  return <Container layout={layout}>{children}</Container>;
}
DashboardTileContainer.displayName = 'DashboardTileContainer';
