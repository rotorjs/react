import {
  Dashboard,
  DashboardLayoutContext,
  DashboardTileContainer,
  DashboardTiles,
  useDashboardLayoutContext,
  useDashboardState,
  type DashboardTileContainerProps,
} from '@/main';
import {
  DashboardEventTarget,
  type DashboardLayoutNode,
  type DashboardTileNode,
} from '@rotorjs/dashboard';
import { attachWorker } from '@rotorjs/state';
import { useMemo, type PropsWithChildren } from 'react';
// eslint-disable-next-line import-x/default
import Worker from './worker?worker';

import './App.css';

const worker = new Worker();
const target = new DashboardEventTarget();
attachWorker(target, worker);

(window as typeof window & { target: DashboardEventTarget }).target = target;

function StackTile({ children }: DashboardTileContainerProps) {
  const { type: layout } = useDashboardLayoutContext();

  return (
    <div
      style={{
        backgroundColor: 'lavenderblush',
        borderRadius: 15,
        padding: 10,
      }}
      title={layout}
    >
      {children({ style: { borderRadius: 10 } })}
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
      {({ style: layoutStyle, ...layoutProps }) => (
        <div
          {...layoutProps}
          style={{
            ...layoutStyle,
            width: 100,
            height: 100,
            backgroundColor: 'red',
          }}
        />
      )}
    </DashboardTileContainer>
  );
}

function StateTile(_: DashboardTileNode) {
  const state = useDashboardState({ type: 'demo' });

  return <DashboardTiles content={state} />;
}

const layouts = { stack: StackLayout };
const defaultLayout = { type: 'stack' };
const tiles = { card: CardTile, state: StateTile };
const content = [{ type: 'card' }, { type: 'state' }];

export default function App() {
  return (
    <Dashboard
      target={target}
      layouts={layouts}
      defaultLayout={defaultLayout}
      tiles={tiles}
      content={content}
    />
  );
}
