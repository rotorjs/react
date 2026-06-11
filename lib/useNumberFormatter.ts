import {
  dashboardLocaleFact,
  NumberFormatter,
  type NumberFormat,
} from '@rotorjs/dashboard';
import { useCallback, useContext, useMemo } from 'react';
import { DashboardContext } from './DashboardContext';

export type NumberFormatterOptions = {
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
};

export function useNumberFormatter(init?: NumberFormatterOptions) {
  const { facts } = useContext(DashboardContext);

  const localeFact = facts[dashboardLocaleFact];
  const locale =
    init?.locale ||
    (typeof localeFact === 'string' && localeFact ? localeFact : undefined);

  const formatter = useMemo(() => new NumberFormatter({ locale }), [locale]);

  return useCallback(
    (value: number, format?: NumberFormat) => formatter.format(value, format),
    [formatter],
  );
}
