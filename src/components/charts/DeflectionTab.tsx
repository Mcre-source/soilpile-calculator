
import React from 'react';
import PileResponseChart from './PileResponseChart';

interface DeflectionDataPoint {
  depth: number;
  value: number;
}

interface DeflectionTabProps {
  deflectionPoints: DeflectionDataPoint[];
  maxDeflection: number;
  pileLength: number;
}

const DeflectionTab: React.FC<DeflectionTabProps> = ({ 
  deflectionPoints, 
  maxDeflection, 
  pileLength 
}) => {
  // Calculate appropriate x-axis domain for deflection values
  // Find the min and max values, then add a small buffer for readability
  const values = deflectionPoints.map(p => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Calculate domain with 10% padding on each side for better visibility
  const padding = Math.max(Math.abs(maxValue - minValue) * 0.1, 0.000001); // Ensure minimal padding for very small values
  const xAxisDomain: [number, number] = [minValue - padding, maxValue + padding];

  return (
    <>
      <PileResponseChart
        data={deflectionPoints}
        xLabel="Deflection"
        xUnit="m"
        valueName="Deflection"
        color="#8884d8"
        pileLength={pileLength}
        xAxisDomain={xAxisDomain}
      />
      <div className="text-sm mt-2">
        <p>Maximum Deflection: {maxDeflection.toExponential(4)} m</p>
        <p className="text-xs text-gray-500 mt-1">
          This graph shows the lateral deflection of the pile as a function of depth.
          Positive values indicate deflection in the direction of the applied load.
        </p>
      </div>
    </>
  );
};

export default DeflectionTab;
