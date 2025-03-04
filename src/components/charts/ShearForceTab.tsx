
import React from 'react';
import PileResponseChart from './PileResponseChart';

interface ShearDataPoint {
  depth: number;
  value: number;
}

interface ShearForceTabProps {
  shearPoints: ShearDataPoint[];
  maxShear: number;
  pileLength: number;
}

const ShearForceTab: React.FC<ShearForceTabProps> = ({ 
  shearPoints, 
  maxShear, 
  pileLength 
}) => {
  return (
    <>
      <PileResponseChart
        data={shearPoints}
        xLabel="Shear Force"
        xUnit="kN"
        valueName="Shear Force"
        color="#ff7300"
        pileLength={pileLength}
      />
      <div className="text-sm mt-2">
        <p>Maximum Shear Force: {maxShear.toFixed(2)} kN</p>
        <p className="text-xs text-gray-500 mt-1">
          This graph shows the shear force in the pile as a function of depth.
          Positive values indicate shear in the direction of the applied load.
        </p>
      </div>
    </>
  );
};

export default ShearForceTab;
