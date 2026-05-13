import { attachWorker } from '@rotorjs/core';
import {
  DashboardEngine,
  DashboardReducer,
  type DashboardState,
} from '@rotorjs/dashboards';

class DemoReducer extends DashboardReducer {
  constructor(
    engine: DashboardEngine,
    initialState: DashboardState,
    callback: (state: DashboardState) => void,
  ) {
    super(engine, initialState, callback);

    this.update();
  }

  reduce(_prevState: DashboardState): DashboardState | Promise<DashboardState> {
    return [{ type: 'card' }];
  }
}

const engine = new DashboardEngine(
  (engine, _init, callback) => new DemoReducer(engine, [], callback),
);
attachWorker(engine, self);
