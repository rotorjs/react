import {
  DashboardEnvironment,
  DashboardEventTarget,
  type DashboardAction,
  type DashboardFact,
  type DashboardLayoutNode,
  type DashboardTileNode,
  type DashboardVar,
  type NavigateDashboardAction,
} from '@rotorjs/dashboard';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
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
  target: Promise<DashboardEventTarget> | DashboardEventTarget;
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
  target: targetProp,
  initialVars: initialVarsProp,
  initialFacts: initialFactsProp,
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
  const [targetPromise] = useState(targetProp);
  if (targetPromise !== targetProp) {
    console.warn(
      "Target must not replaced in a Dashboard's lifetime. Reuse the existing target or set a key to replace the Dashboard with a new one.",
    );
  }

  const [initialVars] = useState(() => Object.entries(initialVarsProp ?? {}));
  const [initialFacts] = useState(() => Object.entries(initialFactsProp ?? {}));

  const [target, setTarget] = useState<DashboardEventTarget>();
  const [environment, setEnvironment] = useState<DashboardEnvironment>();

  const actionConfig = { onAction, approveNavigation };
  const actionRef = useRef(actionConfig);
  // eslint-disable-next-line react-hooks/refs
  actionRef.current = actionConfig;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const target = await targetPromise;
      if (signal.aborted) return;

      const environment = new DashboardEnvironment(target, {
        vars: initialVars,
        facts: initialFacts,
      });
      signal.addEventListener('abort', () => {
        environment.stop();
      });
      setEnvironment(environment);

      target.addEventListener(
        'action',
        (event) => {
          const action = event.action as
            | NavigateDashboardAction
            | { type: never };
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
        { signal },
      );

      setTarget(target);
    })();

    return () => {
      controller.abort();
    };
  }, [targetPromise, initialVars, initialFacts]);

  const vars = useSyncExternalStore(
    useCallback(
      (cb: () => void) => {
        if (!environment) return () => {};
        const controller = new AbortController();
        const signal = controller.signal;
        environment.addEventListener(
          'var',
          () => {
            cb();
          },
          { signal },
        );
        return () => {
          controller.abort();
        };
      },
      [environment],
    ),
    () => environment?.vars ?? initialVars,
  );

  const facts = useSyncExternalStore(
    useCallback(
      (cb: () => void) => {
        if (!environment) return () => {};
        const controller = new AbortController();
        const signal = controller.signal;
        environment.addEventListener(
          'fact',
          () => {
            cb();
          },
          { signal },
        );
        return () => {
          controller.abort();
        };
      },
      [environment],
    ),
    () => environment?.facts ?? initialFacts,
  );

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
