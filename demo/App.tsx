import {
  Dashboard,
  DashboardLayoutContext,
  DashboardTileContainer,
  DashboardTiles,
  useDashboardState,
  type DashboardTileContainerProps,
} from '@/main';
import { attachWorker } from '@rotorjs/core';
import {
  DashboardEventTarget,
  type DashboardLayoutNode,
  type DashboardTileNode,
} from '@rotorjs/dashboards';
import { useContext, useMemo, type PropsWithChildren } from 'react';
// eslint-disable-next-line import-x/default
import Worker from './worker?worker';

import './App.css';

const worker = new Worker();
const engine = new DashboardEventTarget();
attachWorker(engine, worker);

(window as typeof window & { engine: DashboardEventTarget }).engine = engine;

function StackTile({ children }: DashboardTileContainerProps) {
  const { type: layout } = useContext(DashboardLayoutContext);

  return (
    <div
      style={{
        backgroundColor: 'lavenderblush',
        borderRadius: 15,
        padding: 10,
      }}
      title={layout}
    >
      {children}
    </div>
  );
}

function StackLayout({
  type,
  children,
}: PropsWithChildren<DashboardLayoutNode>) {
  const context = useMemo(() => ({ type, tileContainer: StackTile }), [type]);

  return (
    <DashboardLayoutContext.Provider value={context}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </DashboardLayoutContext.Provider>
  );
}

function CardTile({ layout }: DashboardTileNode) {
  return (
    <DashboardTileContainer layout={layout}>
      <div
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          borderRadius: 10,
        }}
      />
    </DashboardTileContainer>
  );
}

function StateTile(_: DashboardTileNode) {
  const state = useDashboardState({});

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
