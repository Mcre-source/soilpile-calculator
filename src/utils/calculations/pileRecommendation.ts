
import { SAFETY_FACTORS } from '../constants';
import { calculateLateralCapacity } from './lateralCapacity';

// Recommended pile dimensions based on required capacity
export const recommendPileDimensions = (
  requiredCapacity: number,
  soilLayers: any[],
  waterTableDepth: number,
  material: any,
  bearingSafetyFactor: number = SAFETY_FACTORS.bearing,
  structuralSafetyFactor: number = SAFETY_FACTORS.structural
) => {
  const recommendations = [];
  
  // Try different diameters and lengths
  const diameters = [0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
  const lengths = [5, 10, 15, 20, 25, 30];
  
  for (const diameter of diameters) {
    for (const length of lengths) {
      const pileProperties = { diameter, length };
      
      // For lateral loads, calculate the lateral capacity directly
      const lateralCapacityResults = calculateLateralCapacity(
        soilLayers,
        pileProperties,
        waterTableDepth,
        0, // Force at ground level for comparison
        bearingSafetyFactor
      );
      
      // Check if this pile configuration meets the required lateral capacity
      if (lateralCapacityResults.allowableLateralCapacity >= requiredCapacity) {
        // For lateral loading, we'll check bending stress rather than compression
        // This is a simplified approach - actual bending capacity would need more detailed calculation
        const moment = requiredCapacity * (length / 3); // Simplified moment calculation
        const momentOfInertia = Math.PI * Math.pow(diameter/2, 4) / 4;
        const maxFiberDistance = diameter / 2;
        const bendingStress = (moment * maxFiberDistance) / momentOfInertia / 1000; // MPa
        
        const allowableBendingStress = material.yield_strength / structuralSafetyFactor;
        const utilizationRatio = bendingStress / allowableBendingStress;
        
        if (utilizationRatio <= 1.0) {
          recommendations.push({
            diameter,
            length,
            allowableCapacity: lateralCapacityResults.allowableLateralCapacity,
            utilizationRatio: utilizationRatio,
            efficiency: lateralCapacityResults.allowableLateralCapacity / requiredCapacity,
            bendingStress: bendingStress,
            allowableBendingStress: allowableBendingStress
          });
          
          // Break out of the inner loop since we found a valid length for this diameter
          break;
        }
      }
    }
  }
  
  // Sort recommendations by efficiency (closest to 1.0 is most efficient)
  recommendations.sort((a, b) => 
    Math.abs(a.efficiency - 1.2) - Math.abs(b.efficiency - 1.2)
  );
  
  return recommendations.length > 0 ? recommendations.slice(0, 3) : [];
};
