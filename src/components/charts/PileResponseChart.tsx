import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RectangleVertical } from 'lucide-react';

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
  const minDepth = -0.5;
  const maxDepth = pileLength > 0 ? pileLength * 1.1 : Math.max(...data.map(p => p.depth)) * 1.1;

  const PileIcon = () => (
    <div className="flex items-center">
      <RectangleVertical className="w-4 h-4 mr-1" />
      <span>Pile Length ({pileLength}m)</span>
    </div>
  );

  const customFormatter = (value: number, name: string, props: any) => {
    if (props.payload.originalValue !== undefined) {
      const displayValue = props.payload.originalValue * 1000;
      return [`${displayValue.toFixed(2)} ${xUnit}`, valueName];
    }
    
    if (Math.abs(value) < 0.001) {
      return [`${value.toExponential(4)} ${xUnit}`, name];
    }
    return [`${value.toFixed(6)} ${xUnit}`, name];
  };

  if (horizontalLayout) {
    return (
      <div className="h-96 py-4">
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
              tickFormatter={(value) => {
                const displayValue = value * (xUnit === 'mm' ? 1 : 1000);
                if (Math.abs(displayValue) < 0.001) {
                  return displayValue.toExponential(2);
                }
                return displayValue.toFixed(Math.abs(displayValue) < 0.1 ? 2 : 1);
              }}
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
            <Legend content={() => <PileIcon />} />
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
      </div>
    );
  }

  return (
    <div className="h-96 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="value"
            type="number"
            domain={xAxisDomain}
            label={{ value: `${xLabel} (${xUnit})${scaleFactor > 1 ? ` (scaled ${scaleFactor.toFixed(1)}x)` : ''}`, position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => {
              if (Math.abs(value) < 0.001) {
                return value.toExponential(2);
              }
              return value.toFixed(Math.abs(value) < 0.1 ? 4 : 2);
            }}
          />
          <YAxis 
            reversed={invertYAxis}
            domain={[minDepth, maxDepth]}
            label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={customFormatter}
            labelFormatter={(label: any) => `Depth: ${label} m`}
          />
          <Legend content={() => <PileIcon />} />
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
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PileResponseChart;
