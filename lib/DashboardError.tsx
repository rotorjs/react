import type { ErrorDashboardNode } from '@rotorjs/dashboards';

export function DashboardError({ error }: ErrorDashboardNode) {
  throw error;
}
