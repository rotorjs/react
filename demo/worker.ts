import {
  DashboardEngine,
  DashboardStateReducer,
  type DashboardState,
  type DashboardStateDescriptor,
} from '@rotorjs/dashboard';
import { attachWorker } from '@rotorjs/state';

class DemoReducer extends DashboardStateReducer {
  constructor(engine: DashboardEngine, descriptor: DashboardStateDescriptor) {
    super(engine, descriptor);

    this.update();
  }

  reduce(_prevState: DashboardState): DashboardState | Promise<DashboardState> {
    return [{ type: 'card' }];
  }
}

const engine = new DashboardEngine({
  demo: {
    getReducerID: () => '',
    createReducer: (engine, descriptor) => new DemoReducer(engine, descriptor),
  },
});
attachWorker(engine, self);
