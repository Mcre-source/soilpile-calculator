
import React from 'react';
import { RectangleVertical } from 'lucide-react';

interface PileIconProps {
  pileLength: number;
}

const PileIcon: React.FC<PileIconProps> = ({ pileLength }) => {
  return (
    <div className="flex items-center">
      <RectangleVertical className="w-4 h-4 mr-1" />
      <span>Pile Length ({pileLength}m)</span>
    </div>
  );
};

export default PileIcon;
