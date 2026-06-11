import {
  DashboardEngine,
  DashboardEventTarget,
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

const target = new DashboardEventTarget();
attachWorker(target, self);
const _engine = new DashboardEngine(target, {
  demo: {
    getReducerID: () => '',
    createReducer: (engine, descriptor) => new DemoReducer(engine, descriptor),
  },
});
