import { ActionEvent } from '@rotorjs/core';
import type {
  DashboardEventTarget,
  DashboardFact,
  DashboardLayoutNode,
  DashboardTileNode,
  DashboardVar,
  FactDashboardAction,
  VarDashboardAction,
} from '@rotorjs/dashboards';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { v7 as uuid } from 'uuid';
import {
  DashboardContext,
  type DashboardLayoutMap,
  type DashboardTileMap,
} from './DashboardContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardTiles } from './DashboardTiles';

export type DashboardProps = {
  engine: DashboardEventTarget;
  initialVars?: { [name: string]: DashboardVar };
  initialFacts?: { [name: string]: DashboardFact };
  layouts: DashboardLayoutMap;
  defaultLayout?: DashboardLayoutNode;
  tiles: DashboardTileMap;
  layout?: DashboardLayoutNode;
  content: DashboardTileNode[];
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
  children,
}: DashboardProps) {
  const [initialVars] = useState(rawInitialVars ?? {});
  const [vars, setVars] = useState(initialVars);

  const [initialFacts] = useState(rawInitialFacts ?? {});
  const [facts, setFacts] = useState(initialFacts);

  useEffect(() => {
    const emitterID = uuid();
    const controller = new AbortController();
    const signal = controller.signal;

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

    engine.addEventListener(
      'action',
      (event) => {
        if (event.emitter === emitterID) return;

        const action = event.action as
          | VarDashboardAction
          | FactDashboardAction
          | { type: never };

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
            return;

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
        }
      },
      { signal },
    );

    return () => {
      controller.abort();
    };
  }, [engine, initialVars, initialFacts]);

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
