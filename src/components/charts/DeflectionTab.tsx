
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
  
  // Calculate domain with padding on each side for better visibility
  // Using a larger padding factor for deflection to make it more visible
  const padding = Math.max(Math.abs(maxValue - minValue) * 0.5, 0.000001); // Increased padding for better visualization
  const xAxisDomain: [number, number] = [minValue - padding, maxValue + padding];

  // Create a separate series of points to visualize the undeflected pile (vertical line)
  const undeflectedPoints = deflectionPoints.map(point => ({
    depth: point.depth,
    value: 0 // Zero deflection represents the original pile position
  }));

  // Calculate scale factor to exaggerate deflection for visualization
  // This makes small deflections visible in the chart
  const scaleFactor = Math.max(1, 50 / maxDeflection); // Apply stronger scaling factor
  
  // Create scaled deflection points for visualization
  // This creates the curved pile effect by offsetting each point by its deflection
  const scaledDeflectionPoints = deflectionPoints.map(point => ({
    depth: point.depth,
    value: point.value * scaleFactor,
    originalValue: point.value // Keep original value for tooltips
  }));

  return (
    <>
      <PileResponseChart
        data={scaledDeflectionPoints}
        xLabel="Lateral Displacement"
        xUnit="m"
        valueName="Displacement"
        color="#8884d8"
        pileLength={pileLength}
        xAxisDomain={xAxisDomain}
        showUndeflectedPile={true}
        undeflectedPoints={undeflectedPoints}
        scaleFactor={scaleFactor}
        horizontalLayout={true}
      />
      <div className="text-sm mt-2">
        <p>Maximum Lateral Displacement: {maxDeflection.toExponential(4)} m</p>
        <p className="text-xs text-gray-500 mt-1">
          This graph shows the lateral displacement of the pile as a function of depth.
          Positive values indicate displacement in the direction of the applied load.
          <br />
          <span className="italic">Note: Displacement has been scaled by a factor of {scaleFactor.toFixed(1)}x for better visualization.</span>
        </p>
      </div>
    </>
  );
};

export default DeflectionTab;
