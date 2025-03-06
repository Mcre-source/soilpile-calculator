
import React from 'react';
import HorizontalPileChart from './components/HorizontalPileChart';
import VerticalPileChart from './components/VerticalPileChart';

interface DataPoint {
  depth: number;
  value: number;
  originalValue?: number;
}

interface PileResponseChartProps {
  data: DataPoint[];
  xLabel: string;
  xUnit: string;
  valueName: string;
  color: string;
  pileLength: number;
  xAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  showUndeflectedPile?: boolean;
  undeflectedPoints?: DataPoint[];
  scaleFactor?: number;
  horizontalLayout?: boolean;
  invertYAxis?: boolean;
}

const PileResponseChart: React.FC<PileResponseChartProps> = ({
  data,
  xLabel,
  xUnit,
  valueName,
  color,
  pileLength,
  xAxisDomain = ['dataMin', 'dataMax'],
  showUndeflectedPile = false,
  undeflectedPoints = [],
  scaleFactor = 1,
  horizontalLayout = false,
  invertYAxis = true
}) => {
  return (
    <div className="h-96 py-4">
      {horizontalLayout ? (
        <HorizontalPileChart
          data={data}
          xLabel={xLabel}
          xUnit={xUnit}
          valueName={valueName}
          color={color}
          pileLength={pileLength}
          xAxisDomain={xAxisDomain}
          showUndeflectedPile={showUndeflectedPile}
          undeflectedPoints={undeflectedPoints}
          scaleFactor={scaleFactor}
          invertYAxis={invertYAxis}
        />
      ) : (
        <VerticalPileChart
          data={data}
          xLabel={xLabel}
          xUnit={xUnit}
          valueName={valueName}
          color={color}
          pileLength={pileLength}
          xAxisDomain={xAxisDomain}
          showUndeflectedPile={showUndeflectedPile}
          undeflectedPoints={undeflectedPoints}
          scaleFactor={scaleFactor}
          invertYAxis={invertYAxis}
        />
      )}
    </div>
  );
};

export default PileResponseChart;
