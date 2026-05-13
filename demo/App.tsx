import {
  Dashboard,
  DashboardTiles,
  useDashboardState,
  type DashboardLayoutNode,
  type DashboardTileNode,
} from '@/main';
import { attachWorker } from '@rotorjs/core';
import { DashboardEventTarget } from '@rotorjs/dashboards';
// eslint-disable-next-line import-x/default
import Worker from './worker?worker';

import './App.css';
import { useMemo, type PropsWithChildren } from 'react';

const worker = new Worker();
const engine = new DashboardEventTarget();
attachWorker(engine, worker);

(window as typeof window & { engine: DashboardEventTarget }).engine = engine;

function StackLayout({ children }: PropsWithChildren<DashboardLayoutNode>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {children}
    </div>
  );
}

function CardTile(_: DashboardTileNode) {
  return (
    <div
      style={{ width: 100, height: 100, background: 'red', borderRadius: 10 }}
    />
  );
}

function StateTile(_: DashboardTileNode) {
  const state = useDashboardState(useMemo(() => ({}), []));

  return <DashboardTiles content={state} />;
}

const layouts = { stack: StackLayout };

const defaultLayout = { type: 'stack' };

const tiles = { card: CardTile, state: StateTile };

const content = [{ type: 'card' }, { type: 'state' }];

export default function App() {
  return (
    <Dashboard
      engine={engine}
      layouts={layouts}
      defaultLayout={defaultLayout}
      tiles={tiles}
      content={content}
    />
  );
}
