import type { ErrorDashboardNode } from '@rotorjs/dashboard';

export function DashboardError({ error }: ErrorDashboardNode) {
  throw error;
}
DashboardError.displayName = 'DashboardError';
