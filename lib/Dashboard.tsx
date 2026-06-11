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
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DashboardContext,
  type DashboardLayoutMap,
  type DashboardTileMap,
} from './DashboardContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardTiles } from './DashboardTiles';

const defaultNavigateOrigins = { [window.location.origin]: true };

export type DashboardProps = {
  target: DashboardEventTarget;
  initialVars?: { [name: string]: DashboardVar };
  initialFacts?: { [name: string]: DashboardFact };
  layouts: DashboardLayoutMap;
  defaultLayout?: DashboardLayoutNode;
  tiles: DashboardTileMap;
  layout?: DashboardLayoutNode;
  content: DashboardTileNode[];
  onAction?: (action: DashboardAction) => boolean | void;
  allowedNavigateOrigins?: { [origin: string]: boolean };
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
  onAction,
  allowedNavigateOrigins: rawAllowedNavigateOrigins = defaultNavigateOrigins,
  children,
}: DashboardProps) {
  const [allowedNavigateOrigins, setAllowedNavigateOrigins] = useState(
    rawAllowedNavigateOrigins,
  );
  const [vars, setVars] = useState(initialVars ?? {});
  const [facts, setFacts] = useState(initialFacts ?? {});

  if (!deepEquals(allowedNavigateOrigins, rawAllowedNavigateOrigins)) {
    setAllowedNavigateOrigins(rawAllowedNavigateOrigins);
  }

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
            const origin = url.origin;
            if (
              !allowedNavigateOrigins['*'] &&
              (!Object.hasOwn(allowedNavigateOrigins, origin) ||
                !allowedNavigateOrigins[origin])
            ) {
              console.warn(
                `Dashboard navigation blocked: origin "${origin}" is not allowed`,
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
  }, [target, onAction, allowedNavigateOrigins]);

  const context = useMemo(
    () => ({ target, vars, facts, layouts, defaultLayout, tiles }),
    [target, vars, facts, layouts, defaultLayout, tiles],
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
