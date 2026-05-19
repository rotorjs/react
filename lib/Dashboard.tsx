import type {
  DashboardAction,
  DashboardEventTarget,
  DashboardFact,
  DashboardLayoutNode,
  DashboardTileNode,
  DashboardVar,
  FactDashboardAction,
  NavigateDashboardAction,
  VarDashboardAction,
} from '@rotorjs/dashboard';
import { ActionEvent } from '@rotorjs/state';
import deepEquals from 'fast-deep-equal';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { v7 as uuid } from 'uuid';
import {
  DashboardContext,
  type DashboardLayoutMap,
  type DashboardTileMap,
} from './DashboardContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardTiles } from './DashboardTiles';

const defaultNavigateOrigins = { [window.location.origin]: true };

export type DashboardProps = {
  engine: DashboardEventTarget;
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
  engine,
  initialVars: rawInitialVars,
  initialFacts: rawInitialFacts,
  layouts,
  defaultLayout,
  tiles,
  layout,
  content,
  onAction,
  allowedNavigateOrigins: rawAllowedNavigateOrigins = defaultNavigateOrigins,
  children,
}: DashboardProps) {
  const [emitterID] = useState(() => uuid());
  const [initialVars] = useState(rawInitialVars ?? {});
  const [initialFacts] = useState(rawInitialFacts ?? {});
  const [allowedNavigateOrigins, setAllowedNavigateOrigins] = useState(
    rawAllowedNavigateOrigins,
  );
  const [vars, setVars] = useState(initialVars);
  const [facts, setFacts] = useState(initialFacts);

  if (!deepEquals(allowedNavigateOrigins, rawAllowedNavigateOrigins)) {
    setAllowedNavigateOrigins(rawAllowedNavigateOrigins);
  }

  useEffect(() => {
    Object.entries(initialVars).forEach(([name, { value, exposed }]) => {
      const e = new ActionEvent({
        type: 'var',
        name,
        value,
        exposed,
      } satisfies VarDashboardAction);
      e.emitter = emitterID;
      engine.dispatchEvent(e);
    });

    Object.entries(initialFacts).forEach(([name, { value }]) => {
      const e = new ActionEvent({
        type: 'fact',
        name,
        value,
      } satisfies FactDashboardAction);
      e.emitter = emitterID;
      engine.dispatchEvent(e);
    });
  }, [emitterID, engine, initialVars, initialFacts]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    engine.addEventListener(
      'action',
      (event) => {
        const action = event.action as
          | VarDashboardAction
          | FactDashboardAction
          | NavigateDashboardAction
          | { type: never };

        if (event.emitter !== emitterID) {
          switch (action.type) {
            case 'var':
              setVars((prev) => {
                const prevVar = prev[action.name];
                if (
                  Object.hasOwn(prev, action.name) &&
                  prevVar.value === action.value &&
                  prevVar.exposed === (action.exposed ?? false)
                )
                  return prev;
                return {
                  ...prev,
                  [action.name]: {
                    value: action.value,
                    exposed: action.exposed ?? false,
                  },
                };
              });
              break;

            case 'fact':
              setFacts((prev) => {
                const prevFact = prev[action.name];
                if (
                  Object.hasOwn(prev, action.name) &&
                  prevFact.value === action.value
                )
                  return prev;
                return {
                  ...prev,
                  [action.name]: { value: action.value },
                };
              });
              break;
          }
        }

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
  }, [emitterID, engine, onAction, allowedNavigateOrigins]);

  const context = useMemo(
    () => ({ engine, vars, facts, layouts, defaultLayout, tiles }),
    [engine, vars, facts, layouts, defaultLayout, tiles],
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
