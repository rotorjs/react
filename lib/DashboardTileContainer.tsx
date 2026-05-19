import type { DashboardLayoutConfig } from '@rotorjs/dashboard';
import { useContext, type CSSProperties, type ReactNode } from 'react';
import { DashboardLayoutContext } from './DashboardLayoutContext';

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
  const { tileContainer: Container } = useContext(DashboardLayoutContext);

  if (!Container) return children({});

  return <Container layout={layout}>{children}</Container>;
}
