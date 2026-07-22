import type { CSSProperties } from 'react';
import pathContractJson from '../contracts/aetheris-b8-paths.json';

type PathContract = {
  assetId: string;
  source: {
    vertical: { sha256: string; viewBox: [number, number, number, number] };
  };
  pivot: { point: [number, number] };
  geometry: {
    fillRule: 'nonzero' | 'evenodd';
    paths: Array<{ id: string; d: string }>;
  };
};

const pathContract = pathContractJson as unknown as PathContract;
const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = pathContract.source.vertical.viewBox;

type AetherisMarkProps = {
  className?: string;
  title?: string;
  idPrefix?: string;
  style?: CSSProperties;
};

export function AetherisMark({ className, title, idPrefix, style }: AetherisMarkProps) {
  const labelled = Boolean(title);

  return (
    <svg
      className={className}
      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      style={style}
      data-asset-id={pathContract.assetId}
      data-source-sha256={pathContract.source.vertical.sha256}
      data-pivot={`${pathContract.pivot.point[0]},${pathContract.pivot.point[1]}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {pathContract.geometry.paths.map((path) => (
        <path
          key={path.id}
          id={idPrefix ? `${idPrefix}-${path.id}` : path.id}
          data-canonical-path-id={path.id}
          d={path.d}
          fill="currentColor"
          fillRule={pathContract.geometry.fillRule}
        />
      ))}
    </svg>
  );
}
