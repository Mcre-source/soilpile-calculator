
import React from 'react';
import PileResponseChart from './PileResponseChart';

interface MomentDataPoint {
  depth: number;
  value: number;
}

interface BendingMomentTabProps {
  momentPoints: MomentDataPoint[];
  maxMoment: number;
  pileLength: number;
}

const BendingMomentTab: React.FC<BendingMomentTabProps> = ({ 
  momentPoints, 
  maxMoment, 
  pileLength 
}) => {
  return (
    <>
      <PileResponseChart
        data={momentPoints}
        xLabel="Bending Moment"
        xUnit="kN·m"
        valueName="Bending Moment"
        color="#82ca9d"
        pileLength={pileLength}
      />
      <div className="text-sm mt-2">
        <p>Maximum Bending Moment: {maxMoment.toFixed(2)} kN·m</p>
        <p className="text-xs text-gray-500 mt-1">
          This graph shows the bending moment in the pile as a function of depth.
          Positive values indicate tension on the side facing the applied load.
        </p>
      </div>
    </>
  );
};

export default BendingMomentTab;
