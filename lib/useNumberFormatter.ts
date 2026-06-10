import { NumberFormatter, type NumberFormat } from '@rotorjs/dashboard';
import { useCallback, useMemo } from 'react';

export type NumberFormatterOptions = {
  locale?: Intl.UnicodeBCP47LocaleIdentifier;
};

export function useNumberFormatter(init?: NumberFormatterOptions) {
  const { locale } = init ?? {};

  const formatter = useMemo(() => new NumberFormatter({ locale }), [locale]);

  return useCallback(
    (value: number, format?: NumberFormat) => formatter.format(value, format),
    [formatter],
  );
}
