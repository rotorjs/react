import type { DashboardReducerInit, DashboardState } from '@rotorjs/dashboards';
import deepEquals from 'fast-deep-equal';
import { useContext, useEffect, useState } from 'react';
import { v7 as uuid } from 'uuid';
import { DashboardContext } from './DashboardContext';

export function useDashboardState(
  init: DashboardReducerInit,
  initialState: DashboardState = [],
): DashboardState {
  const { engine } = useContext(DashboardContext);

  const [memoInit, setMemoInit] = useState(init);
  const [state, setState] = useState(initialState);

  if (!deepEquals(init, memoInit)) {
    setMemoInit(memoInit);
  }

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

    engine.registerReducer(id, memoInit);

    return () => {
      controller.abort();
      engine.removeReducer(id);
    };
  }, [memoInit, engine]);

  return state;
}
