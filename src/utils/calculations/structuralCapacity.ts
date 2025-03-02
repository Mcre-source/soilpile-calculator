
import { SAFETY_FACTORS } from '../constants';

/**
 * Check structural capacity of the pile
 * @param pileProperties Pile properties including diameter and material
 * @param material Material properties including yield strength
 * @param appliedLoad Applied load in kN
 * @param safetyFactor Safety factor for structural capacity
 * @returns Object containing capacity check results
 */
export const checkStructuralCapacity = (
  pileProperties: any,
  material: any,
  appliedLoad: number,
  safetyFactor: number = SAFETY_FACTORS.structural
) => {
  try {
    // Calculate cross-sectional area
    const pileRadius = pileProperties.diameter / 2;
    let crossSectionalArea = Math.PI * Math.pow(pileRadius, 2);
    
    // If it's a steel pipe pile, adjust for hollow section
    if (pileProperties.material === 'steel' && pileProperties.wallThickness) {
      const innerRadius = pileRadius - pileProperties.wallThickness;
      crossSectionalArea = Math.PI * (Math.pow(pileRadius, 2) - Math.pow(innerRadius, 2));
    }
    
    // Calculate compressive stress (MPa)
    // Ensure applied load is a number and greater than zero to avoid NaN results
    const safeAppliedLoad = typeof appliedLoad === 'number' && !isNaN(appliedLoad) && appliedLoad > 0 
      ? appliedLoad 
      : 0;
    
    const compressiveStress = safeAppliedLoad / crossSectionalArea / 1000; // Convert to MPa
    
    // Calculate allowable stress
    const yieldStrength = material?.yield_strength || 1; // Fallback to prevent division by zero
    const allowableStress = yieldStrength / safetyFactor;
    
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
  } catch (error) {
    console.error("Error in structural capacity calculation:", error);
    // Return a safe fallback result
    return {
      crossSectionalArea: 0,
      compressiveStress: 0,
      allowableStress: 0,
      utilizationRatio: 0,
      isAdequate: false,
      notes: "Error occurred during structural capacity calculation. Please check your inputs."
    };
  }
};
