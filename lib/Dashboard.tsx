import {
  DashboardEnvironment,
  type DashboardAction,
  type DashboardEventTarget,
  type DashboardFact,
  type DashboardLayoutNode,
  type DashboardTileNode,
  type DashboardVar,
  type NavigateDashboardAction,
} from '@rotorjs/dashboard';
import deepEquals from 'fast-deep-equal';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DashboardContext,
  type ApproveUserActionFunction,
  type DashboardLayoutMap,
  type DashboardTileMap,
} from './DashboardContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardTiles } from './DashboardTiles';

export type ApproveNavigationFunction = (url: URL) => boolean;

const defaultApproveNavigation: ApproveNavigationFunction = (url) =>
  url.origin === window.location.origin;

export type DashboardProps = {
  target: DashboardEventTarget;
  initialVars?: { [name: string]: DashboardVar };
  initialFacts?: { [name: string]: DashboardFact };
  layouts: DashboardLayoutMap;
  defaultLayout?: DashboardLayoutNode;
  tiles: DashboardTileMap;
  layout?: DashboardLayoutNode;
  content: DashboardTileNode[];
  approveUserAction?: ApproveUserActionFunction;
  approveNavigation?: ApproveNavigationFunction;
  onAction?: (action: DashboardAction) => boolean | void;
  children?: ReactNode;
};

export function Dashboard({
  target,
  initialVars,
  initialFacts,
  layouts,
  defaultLayout,
  tiles,
  layout,
  content,
  approveUserAction,
  approveNavigation = defaultApproveNavigation,
  onAction,
  children,
}: DashboardProps) {
  const [vars, setVars] = useState(initialVars ?? {});
  const [facts, setFacts] = useState(initialFacts ?? {});

  const approveNavigationRef = useRef(approveNavigation);
  // eslint-disable-next-line react-hooks/refs
  approveNavigationRef.current = approveNavigation;

  useEffect(() => {
    const environment = new DashboardEnvironment(target, { vars, facts });

    environment.addEventListener('var', (event) => {
      setVars((prev) => {
        const prevValue = prev[event.name];
        const nextValue = { value: event.value, exposed: event.exposed };
        if (Object.hasOwn(prev, event.name) && deepEquals(prevValue, nextValue))
          return prev;
        return { ...prev, [event.name]: nextValue };
      });
    });

    environment.addEventListener('fact', (event) => {
      setFacts((prev) => {
        const prevValue = prev[event.name];
        const nextValue = { value: event.value };
        if (Object.hasOwn(prev, event.name) && deepEquals(prevValue, nextValue))
          return prev;
        return { ...prev, [event.name]: nextValue };
      });
    });

    return () => {
      environment.stop();
    };
    // Changes to vars and facts from the state system mustn't recreate a new environment.
    // However, if target is replaced, the currently known vars and facts should be synchronized into the state system.
    // This is why vars and facts are not included in the dependencies array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    target.addEventListener(
      'action',
      (event) => {
        const action = event.action as
          | NavigateDashboardAction
          | { type: never };

        const handled = onAction?.(event.action);
        if (handled) return;

        switch (action.type) {
          case 'navigate': {
            const url = new URL(action.href, window.location.href);
            if (!approveNavigationRef.current(url)) {
              console.warn(
                `Dashboard navigation blocked: URL "${url.href}" is not allowed`,
              );
              break;
            }
            if (action.replace) window.location.replace(action.href);
            else window.location.assign(action.href);
            break;
          }
        }
      },
      { signal },
    );

    return () => {
      controller.abort();
    };
  }, [target, onAction]);

  const context = useMemo(
    () => ({
      target,
      vars,
      facts,
      layouts,
      defaultLayout,
      tiles,
      approveUserAction: approveUserAction ?? (() => true),
    }),
    [target, vars, facts, layouts, defaultLayout, tiles, approveUserAction],
  );

  return (
    <DashboardContext.Provider value={context}>
      <DashboardLayout layout={layout}>
        <DashboardTiles content={content} />

        {children}
      </DashboardLayout>
    </DashboardContext.Provider>
  );
}
Dashboard.displayName = 'Dashboard';
