import type { DashboardReducerInit, DashboardState } from '@rotorjs/dashboards';
import { useContext, useEffect, useState } from 'react';
import { v7 as uuid } from 'uuid';
import { DashboardContext } from './DashboardContext';

export function useDashboardState(
  init: DashboardReducerInit,
  initialState: DashboardState = [],
): DashboardState {
  const { engine } = useContext(DashboardContext);

  const [state, setState] = useState(initialState);

  useEffect(() => {
    const id = uuid();
    const controller = new AbortController();
    const signal = controller.signal;

    engine.addEventListener(
      'state',
      (event) => {
        if (event.id === id) {
          setState(event.state);
        }
      },
      { signal },
    );

    engine.registerReducer(id, init);

    return () => {
      controller.abort();
      engine.removeReducer(id);
    };
  }, [init, engine]);

  return state;
}
