import type {
  DashboardLayoutNode,
  ErrorDashboardNode,
} from '@rotorjs/dashboards';
import {
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { DashboardContext, type DashboardLayoutMap } from './DashboardContext';
import { DashboardError } from './DashboardError';
import { getKey } from './getKey';

export type DashboardLayoutProps = {
  layout?: DashboardLayoutNode;
  children: ReactNode;
};

export function DashboardLayout({ layout, children }: DashboardLayoutProps) {
  const { layouts: userLayouts, defaultLayout } = useContext(DashboardContext);

  const layouts = useMemo<DashboardLayoutMap>(
    () => ({
      error: DashboardError as ComponentType<
        PropsWithChildren<DashboardLayoutNode>
      >,
      ...userLayouts,
    }),
    [userLayouts],
  );

  const layoutNode = layout ?? defaultLayout;
  if (!layoutNode) return null;

  const Layout = layouts[layoutNode.type];
  if (!Layout) {
    const Error = layouts.error as ComponentType<ErrorDashboardNode>;
    const errorNode = {
      type: 'error' as const,
      error: `Invalid layout type "${layoutNode.type}"`,
    };
    return <Error {...errorNode} key={getKey(errorNode)} />;
  }

  return (
    <Layout {...layoutNode} key={getKey(layoutNode)}>
      {children}
    </Layout>
  );
}
