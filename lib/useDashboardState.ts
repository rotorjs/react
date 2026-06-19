import {
  DashboardStateConsumer,
  type DashboardState,
  type DashboardStateDescriptor,
} from '@rotorjs/dashboard';
import deepEquals from 'fast-deep-equal';
import { useEffect, useState } from 'react';
import { useDashboardContext } from './useDashboardContext';

export function useDashboardState(
  descriptor: DashboardStateDescriptor,
  initialState: DashboardState = [],
): DashboardState {
  const { target } = useDashboardContext();

  const [memoDescriptor, setMemoDescriptor] = useState(descriptor);
  const [state, setState] = useState(initialState);

  if (!deepEquals(memoDescriptor, descriptor)) {
    setMemoDescriptor(descriptor);
  }

  useEffect(() => {
    if (!target) return;

    const consumer = new DashboardStateConsumer(
      target,
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
  }, [target, memoDescriptor]);

  return state;
}
