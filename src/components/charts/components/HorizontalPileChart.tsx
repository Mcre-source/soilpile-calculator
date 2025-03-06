
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import PileIcon from './PileIcon';
import { formatTooltipValue, formatAxisTick } from '../utils/chartFormatters';

interface DataPoint {
  depth: number;
  value: number;
  originalValue?: number;
}

interface HorizontalPileChartProps {
  data: DataPoint[];
  xLabel: string;
  xUnit: string;
  valueName: string;
  color: string;
  pileLength: number;
  xAxisDomain: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  showUndeflectedPile: boolean;
  undeflectedPoints: DataPoint[];
  scaleFactor: number;
  invertYAxis: boolean;
}

const HorizontalPileChart: React.FC<HorizontalPileChartProps> = ({
  data,
  xLabel,
  xUnit,
  valueName,
  color,
  pileLength,
  xAxisDomain,
  showUndeflectedPile,
  undeflectedPoints,
  scaleFactor,
  invertYAxis
}) => {
  const minDepth = -0.5;
  const maxDepth = pileLength > 0 ? pileLength * 1.1 : Math.max(...data.map(p => p.depth)) * 1.1;

  const customFormatter = (value: number, name: string, props: any) => {
    return formatTooltipValue(value, name, { ...props, unit: xUnit });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          domain={xAxisDomain}
          label={{ value: `${xLabel} (${xUnit})${scaleFactor > 1 ? ` (scaled ${scaleFactor.toFixed(1)}x)` : ''}`, position: 'insideBottom', offset: -5 }}
          tickFormatter={(value) => formatAxisTick(value, xUnit)}
          allowDataOverflow={false}
        />
        <YAxis 
          dataKey="depth"
          type="number"
          reversed={invertYAxis}
          domain={[minDepth, maxDepth]}
          label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
          allowDataOverflow={false}
        />
        <Tooltip 
          formatter={customFormatter}
          labelFormatter={(label: any) => `Depth: ${label} m`}
          coordinate={{ x: 0, y: 0 }}
          cursor={{ stroke: '#ccc', strokeWidth: 1 }}
        />
        <Legend content={() => <PileIcon pileLength={pileLength} />} />
        <ReferenceLine
          y={pileLength}
          stroke="#333"
          strokeDasharray="3 3"
          label={{ value: 'Pile Tip', position: 'insideBottomRight' }}
        />
        
        {showUndeflectedPile && (
          <ReferenceLine
            x={0}
            stroke="#888"
            strokeWidth={1.5}
            label={{ value: 'Undeflected', position: 'insideTopRight', fontSize: 10 }}
          />
        )}
        
        {showUndeflectedPile && undeflectedPoints.length > 0 && (
          <Line 
            data={undeflectedPoints}
            type="monotone"
            dataKey="value"
            name="Original Position"
            stroke="#888"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        )}
        
        <Line 
          type="monotone"
          dataKey="value"
          name={valueName}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HorizontalPileChart;
