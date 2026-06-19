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
import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
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

const defaultApproveUserAction: ApproveUserActionFunction = () => true;

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
  /* eslint-disable react-hooks/refs */
  const environmentRef = useRef<EnvironmentHandler>(undefined);
  if (!environmentRef.current) {
    environmentRef.current = setupEnvironment(
      target,
      Object.entries(initialVars ?? {}),
      Object.entries(initialFacts ?? {}),
    );
  }
  if (environmentRef.current.environment.target !== target) {
    const prev = environmentRef.current.environment;
    prev.stop();
    environmentRef.current = setupEnvironment(target, prev.vars, prev.facts);
  }
  useEffect(
    () => () => {
      // stop environment on unmount
      environmentRef.current?.environment.stop();
    },
    [],
  );
  const environment = environmentRef.current.environment;
  const vars = useSyncExternalStore(
    environmentRef.current.subscribeVars,
    () => environment.vars,
  );
  const facts = useSyncExternalStore(
    environmentRef.current.subscribeFacts,
    () => environment.facts,
  );
  /* eslint-enable react-hooks/refs */

  /* eslint-disable react-hooks/refs */
  const actionRef = useRef({ onAction, approveNavigation });
  actionRef.current = { onAction, approveNavigation };
  const actionListenerRef = useRef<ActionListener>(undefined);
  if (!actionListenerRef.current) {
    actionListenerRef.current = subscribeActions(target, actionRef);
  }
  if (actionListenerRef.current.target !== target) {
    const prev = actionListenerRef.current;
    prev.controller.abort();
    actionListenerRef.current = subscribeActions(target, actionRef);
  }
  useEffect(
    () => () => {
      // stop action listener on unmount
      actionListenerRef.current?.controller.abort();
    },
    [],
  );
  /* eslint-enable react-hooks/refs */

  const varMap = useMemo(() => Object.fromEntries(vars), [vars]);
  const factMap = useMemo(() => Object.fromEntries(facts), [facts]);
  const context = useMemo(
    () => ({
      target,
      vars: varMap,
      facts: factMap,
      layouts,
      defaultLayout,
      tiles,
      approveUserAction: approveUserAction ?? defaultApproveUserAction,
    }),
    [target, varMap, factMap, layouts, defaultLayout, tiles, approveUserAction],
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

type EnvironmentHandler = {
  environment: DashboardEnvironment;
  subscribeVars: (cb: () => void) => () => void;
  subscribeFacts: (cb: () => void) => () => void;
};

function setupEnvironment(
  target: DashboardEventTarget,
  vars?: readonly [name: string, value: DashboardVar][],
  facts?: readonly [name: string, value: DashboardFact][],
): EnvironmentHandler {
  const environment = new DashboardEnvironment(target, { vars, facts });

  return {
    environment,
    subscribeVars: (cb) => {
      const controller = new AbortController();
      const signal = controller.signal;
      environment.addEventListener('var', cb, { signal });
      return () => {
        controller.abort();
      };
    },
    subscribeFacts: (cb) => {
      const controller = new AbortController();
      const signal = controller.signal;
      environment.addEventListener('fact', cb, { signal });
      return () => {
        controller.abort();
      };
    },
  };
}

type ActionListener = {
  target: DashboardEventTarget;
  controller: AbortController;
};

function subscribeActions(
  target: DashboardEventTarget,
  actionRef: RefObject<{
    onAction?: (action: DashboardAction) => boolean | void;
    approveNavigation: ApproveNavigationFunction;
  }>,
): ActionListener {
  const controller = new AbortController();

  target.addEventListener(
    'action',

    (event) => {
      const action = event.action as NavigateDashboardAction | { type: never };
      const { onAction, approveNavigation } = actionRef.current;

      const handled = onAction?.(event.action);
      if (handled) return;

      switch (action.type) {
        case 'navigate': {
          const url = new URL(action.href, window.location.href);
          if (!approveNavigation(url)) {
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
    { signal: controller.signal },
  );

  return { target, controller };
}
