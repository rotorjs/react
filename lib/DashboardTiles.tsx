import type { DashboardTileNode } from '@rotorjs/dashboard';
import { useContext, useMemo, type ComponentType } from 'react';
import { DashboardContext, type DashboardTileMap } from './DashboardContext';
import { DashboardError } from './DashboardError';
import { DashboardTileError } from './DashboardTileError';
import { getNodeKey } from './getNodeKey';

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
        if (!tileNode?.type) return null;

        const Tile = tiles[tileNode.type];

        if (!Tile) {
          return (
            <DashboardTileError
              key={getNodeKey({ type: 'error' }, index)}
              error={`Invalid tile type "${tileNode.type}"`}
            />
          );
        }

        return <Tile {...tileNode} key={getNodeKey(tileNode, index)} />;
      })}
    </>
  );
}
