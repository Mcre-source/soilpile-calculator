
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

  // Calculate appropriate x-axis domain for deflection values
  // Find the min and max values, then add a small buffer for readability
  const values = scaledDeflectionPoints.map(p => p.value);
  const minValue = Math.min(...values, 0); // Ensure we include zero 
  const maxValue = Math.max(...values, 0); // Ensure we include zero
  
  // Calculate domain with padding on each side for better visibility
  // Using a smaller padding factor to ensure values stay within bounds
  const padding = (maxValue - minValue) * 0.2; // Reduced padding to prevent overflow
  const xAxisDomain: [number, number] = [minValue - padding, maxValue + padding];

  return (
    <>
      <PileResponseChart
        data={scaledDeflectionPoints}
        xLabel="Lateral Displacement"
        xUnit="mm"
        valueName="Displacement"
        color="#8884d8"
        pileLength={pileLength}
        xAxisDomain={xAxisDomain}
        showUndeflectedPile={true}
        undeflectedPoints={undeflectedPoints}
        scaleFactor={scaleFactor}
        horizontalLayout={true}
        invertYAxis={false} // Set to false to have top of pile at top of chart
      />
      <div className="text-sm mt-2">
        <p>Maximum Lateral Displacement: {(maxDeflection * 1000).toFixed(2)} mm</p>
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
