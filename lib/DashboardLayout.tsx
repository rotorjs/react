import type { DashboardLayoutNode } from '@rotorjs/dashboard';
import {
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { DashboardContext, type DashboardLayoutMap } from './DashboardContext';
import { DashboardError } from './DashboardError';
import {
  DashboardLayoutContext,
  type DashboardLayoutContextValue,
} from './DashboardLayoutContext';
import { DashboardLayoutError } from './DashboardLayoutError';
import { getNodeKey } from './getNodeKey';

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
  const layoutType = layoutNode?.type;

  const context = useMemo<DashboardLayoutContextValue>(
    () => ({ type: layoutType! }),
    [layoutType],
  );

  if (!layoutNode?.type) return null;

  const Layout = layouts[layoutNode.type];

  if (!Layout) {
    return (
      <DashboardLayoutError error={`Invalid layout type "${layoutNode.type}"`}>
        {children}
      </DashboardLayoutError>
    );
  }

  return (
    <DashboardLayoutContext.Provider value={context}>
      <Layout {...layoutNode} key={getNodeKey(layoutNode)}>
        {children}
      </Layout>
    </DashboardLayoutContext.Provider>
  );
}
