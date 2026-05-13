import type { ErrorDashboardNode } from '@rotorjs/dashboards';
import { useContext, useMemo, type ComponentType } from 'react';
import { DashboardContext } from './DashboardContext';
import { DashboardError } from './DashboardError';
import type { DashboardTileMap, DashboardTileNode } from './DashboardTileNode';
import { getKey } from './getKey';

export type DashboardTilesProps = {
  content: DashboardTileNode[];
};

export function DashboardTiles({ content }: DashboardTilesProps) {
  const { tiles: userTiles } = useContext(DashboardContext);

  const tiles = useMemo<DashboardTileMap>(() => {
    return {
      error: DashboardError as ComponentType<DashboardTileNode>,
      ...userTiles,
    };
  }, [userTiles]);

  return (
    <>
      {content.map((tileNode, index) => {
        if (!tileNode) return null;

        const Tile = tiles[tileNode.type];
        if (!Tile) {
          const Error = tiles.error as ComponentType<ErrorDashboardNode>;
          const errorNode = {
            type: 'error' as const,
            error: `Invalid tile type "${tileNode.type}"`,
          };
          return <Error {...errorNode} key={getKey(tileNode, index)} />;
        }

        return <Tile {...tileNode} key={getKey(tileNode, index)} />;
      })}
    </>
  );
}
