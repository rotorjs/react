import {
  DashboardStateConsumer,
  type DashboardState,
  type DashboardStateDescriptor,
} from '@rotorjs/dashboard';
import deepEquals from 'fast-deep-equal';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from './DashboardContext';

export function useDashboardState(
  descriptor: DashboardStateDescriptor,
  initialState: DashboardState = [],
): DashboardState {
  const { engine } = useContext(DashboardContext);

  const [memoDescriptor, setMemoDescriptor] = useState(descriptor);
  const [state, setState] = useState(initialState);

  if (!deepEquals(memoDescriptor, descriptor)) {
    setMemoDescriptor(descriptor);
  }

  useEffect(() => {
    const consumer = new DashboardStateConsumer(
      engine,
      memoDescriptor,
      (nextState) => {
        setState((prevState) =>
          deepEquals(nextState, prevState) ? prevState : nextState,
        );
      },
    );

    return () => {
      consumer.stop();
    };
  }, [engine, memoDescriptor]);

  return state;
}
