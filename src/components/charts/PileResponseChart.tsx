
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RectangleVertical } from 'lucide-react';

interface DataPoint {
  depth: number;
  value: number;
}

interface PileResponseChartProps {
  data: DataPoint[];
  xLabel: string;
  xUnit: string;
  valueName: string;
  color: string;
  pileLength: number;
}

const PileResponseChart: React.FC<PileResponseChartProps> = ({
  data,
  xLabel,
  xUnit,
  valueName,
  color,
  pileLength
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
            domain={['dataMin', 'dataMax']}
            label={{ value: `${xLabel} (${xUnit})`, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            reversed
            domain={[minDepth, maxDepth]}
            label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${typeof value === 'number' ? value.toFixed(6) : value} ${xUnit}`, valueName]}
            labelFormatter={(label: any) => `Depth: ${label} m`}
          />
          <Legend content={() => <PileIcon />} />
          <ReferenceLine
            y={pileLength}
            stroke="#333"
            strokeDasharray="3 3"
            label={{ value: 'Pile Tip', position: 'insideBottomRight' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={valueName} 
            stroke={color} 
            dot={false} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PileResponseChart;
