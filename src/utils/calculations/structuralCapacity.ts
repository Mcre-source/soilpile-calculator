
import { SAFETY_FACTORS } from '../constants';

// Check structural capacity of the pile
export const checkStructuralCapacity = (
  pileProperties: any,
  material: any,
  appliedLoad: number,
  safetyFactor: number = SAFETY_FACTORS.structural
) => {
  // Calculate cross-sectional area
  const pileRadius = pileProperties.diameter / 2;
  const crossSectionalArea = Math.PI * Math.pow(pileRadius, 2);
  
  // Calculate compressive stress
  const compressiveStress = appliedLoad / crossSectionalArea / 1000; // Convert to MPa
  
  // Calculate allowable stress
  const allowableStress = material.yield_strength / safetyFactor;
  
  // Calculate utilization ratio
  const utilizationRatio = compressiveStress / allowableStress;
  
  return {
    crossSectionalArea,
    compressiveStress,
    allowableStress,
    utilizationRatio,
    isAdequate: utilizationRatio <= 1.0,
    notes: utilizationRatio <= 0.7 
      ? "The pile has sufficient structural capacity with a good safety margin."
      : utilizationRatio <= 1.0 
        ? "The pile has adequate structural capacity, but consider increasing the size for better long-term performance."
        : "The pile is structurally inadequate for the applied load. Increase the pile dimensions."
  };
};
