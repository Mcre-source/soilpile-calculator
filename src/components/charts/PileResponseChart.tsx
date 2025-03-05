
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
  // Add optional prop for custom domain
  xAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  // Add props for undeflected pile visualization
  showUndeflectedPile?: boolean;
  undeflectedPoints?: DataPoint[];
  scaleFactor?: number;
  // Add prop for horizontal layout (deflection-specific)
  horizontalLayout?: boolean;
}

const PileResponseChart: React.FC<PileResponseChartProps> = ({
  data,
  xLabel,
  xUnit,
  valueName,
  color,
  pileLength,
  // Default to dataMin/dataMax if not provided
  xAxisDomain = ['dataMin', 'dataMax'],
  showUndeflectedPile = false,
  undeflectedPoints = [],
  scaleFactor = 1,
  horizontalLayout = false
}) => {
  // Set the Y-axis domain to show from ground level (0) to the pile length
  const minDepth = 0;
  const maxDepth = pileLength > 0 ? pileLength : Math.max(...data.map(p => p.depth));

  // Custom Pile Icon component to show in the legend
  const PileIcon = () => (
    <div className="flex items-center">
      <RectangleVertical className="w-4 h-4 mr-1" />
      <span>Pile Length ({pileLength}m)</span>
    </div>
  );

  // Custom tooltip formatter to show original values when scaled
  const customFormatter = (value: number, name: string, props: any) => {
    if (props.payload.originalValue !== undefined) {
      // If we have an original value (for scaled deflection), show that
      return [`${props.payload.originalValue.toExponential(4)} ${xUnit}`, valueName];
    }
    
    // For non-scaled values, format as before
    if (Math.abs(value) < 0.001) {
      return [`${value.toExponential(4)} ${xUnit}`, name];
    }
    return [`${value.toFixed(6)} ${xUnit}`, name];
  };

  if (horizontalLayout) {
    // This creates a layout similar to the reference image with depth on y-axis and deflection on x-axis
    return (
      <div className="h-80 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout="vertical" // Key change for horizontal layout
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              domain={xAxisDomain}
              label={{ value: `${xLabel} (${xUnit})${scaleFactor > 1 ? ` (scaled ${scaleFactor.toFixed(1)}x)` : ''}`, position: 'insideBottom', offset: -5 }}
              // Add tickFormatter for better readability of small values
              tickFormatter={(value) => {
                // Use exponential notation for very small numbers
                if (Math.abs(value) < 0.001) {
                  return value.toExponential(2);
                }
                return value.toFixed(Math.abs(value) < 0.1 ? 4 : 2);
              }}
            />
            <YAxis 
              dataKey="depth"
              type="number"
              reversed
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
            
            {/* Add reference line at x=0 to represent undeflected pile position */}
            {showUndeflectedPile && (
              <ReferenceLine
                x={0}
                stroke="#888"
                strokeWidth={1.5}
                label={{ value: 'Undeflected', position: 'insideTopRight', fontSize: 10 }}
              />
            )}
            
            {/* Add undeflected pile line if provided */}
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
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Original vertical layout for other charts (bending moment, shear force)
  return (
    <div className="h-80 py-4">
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
            // Add tickFormatter for better readability of small values
            tickFormatter={(value) => {
              // Use exponential notation for very small numbers
              if (Math.abs(value) < 0.001) {
                return value.toExponential(2);
              }
              return value.toFixed(Math.abs(value) < 0.1 ? 4 : 2);
            }}
          />
          <YAxis 
            reversed
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
          
          {/* Add reference line at x=0 to represent undeflected pile position */}
          {showUndeflectedPile && (
            <ReferenceLine
              x={0}
              stroke="#888"
              strokeWidth={1.5}
              label={{ value: 'Undeflected', position: 'insideTopRight', fontSize: 10 }}
            />
          )}
          
          {/* Add undeflected pile line if provided */}
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
