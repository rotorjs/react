import {
  dashboardLocaleFact,
  NumberFormatter,
  type NumberFormat,
} from '@rotorjs/dashboard';
import { useCallback, useMemo } from 'react';
import { useDashboardContext } from './useDashboardContext';

export type NumberFormatterOptions = {
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
};

export function useNumberFormatter(init?: NumberFormatterOptions) {
  const { facts } = useDashboardContext();

  const localeFact = facts[dashboardLocaleFact]?.value;
  const locale =
    init?.locale ||
    (typeof localeFact === 'string' && localeFact ? localeFact : undefined);

  const formatter = useMemo(() => new NumberFormatter({ locale }), [locale]);

  return useCallback(
    (value: number, format?: NumberFormat) => formatter.format(value, format),
    [formatter],
  );
}
