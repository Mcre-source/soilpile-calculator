
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
  return (
    <>
      <PileResponseChart
        data={deflectionPoints}
        xLabel="Deflection"
        xUnit="m"
        valueName="Deflection"
        color="#8884d8"
        pileLength={pileLength}
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
