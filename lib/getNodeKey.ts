import type { DashboardNode } from '@rotorjs/dashboard';

export function getNodeKey(node: DashboardNode, index: number = 0): string {
  return `${encodeURIComponent(node.type)}:${node.id ? `id:${encodeURIComponent(node.id)}` : `idx:${index}`}`;
}
