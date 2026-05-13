import type { DashboardNode } from '@rotorjs/dashboards';

export function getKey(node: DashboardNode, index: number = 0): string {
  return `${encodeURIComponent(node.type)}:${node.id ? `id:${encodeURIComponent(node.id)}` : `idx:${index}`}`;
}
