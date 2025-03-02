
import { SAFETY_FACTORS } from '../constants';

// Calculate lateral capacity using simplified Broms' method
export const calculateLateralCapacity = (
  soilLayers: any[],
  pileProperties: any,
  waterTableDepth: number,
  forceHeight: number,
  safetyFactor: number = SAFETY_FACTORS.sliding
) => {
  const pileDiameter = pileProperties.diameter;
  const pileLength = pileProperties.length;
  
  // Find the soil layer at the critical depth (typically around 3-5 diameters below ground)
  const criticalDepth = Math.min(5 * pileDiameter, pileLength);
  let criticalLayerIndex = 0;
  let currentDepth = 0;
  
  for (let i = 0; i < soilLayers.length; i++) {
    if (currentDepth + soilLayers[i].thickness >= criticalDepth) {
      criticalLayerIndex = i;
      break;
    }
    currentDepth += soilLayers[i].thickness;
  }
  
  const criticalLayer = soilLayers[criticalLayerIndex];
  
  // Calculate lateral resistance based on soil type
  let lateralCapacity = 0;
  let calculationMethod = '';
  let calculationDetails = [];
  
  // Determine if pile behaves as a short rigid pile or a long flexible pile
  // based on embedded length to diameter ratio
  const lengthToDiameterRatio = pileLength / pileDiameter;
  const isPileRigid = lengthToDiameterRatio < 10; // Simplified criterion
  
  // Adjust soil properties based on water level
  let isLayerUnderWater = waterTableDepth < 0 || criticalDepth > waterTableDepth;
  let effectiveUnitWeight = isLayerUnderWater ? criticalLayer.unitWeight - 9.81 : criticalLayer.unitWeight;
  
  // Store calculation details
  calculationDetails.push({
    description: `Pile length to diameter ratio: ${lengthToDiameterRatio.toFixed(2)}`,
    value: lengthToDiameterRatio,
    notes: isPileRigid ? "Pile behaves as a short rigid pile" : "Pile behaves as a long flexible pile"
  });
  
  calculationDetails.push({
    description: `Effective unit weight at critical depth: ${effectiveUnitWeight.toFixed(2)} kN/m³`,
    value: effectiveUnitWeight,
    notes: isLayerUnderWater ? "Adjusted for submerged condition" : "Dry condition"
  });
  
  if (criticalLayer.cohesion > 0) {
    // Cohesive soil (clay)
    calculationMethod = 'Broms\' method for cohesive soils';
    
    if (isPileRigid) {
      // Short pile in clay (translation + rotation)
      lateralCapacity = 9 * criticalLayer.cohesion * pileDiameter * pileLength / 2;
      
      calculationDetails.push({
        description: `Undrained cohesion of critical layer: ${criticalLayer.cohesion.toFixed(2)} kPa`,
        value: criticalLayer.cohesion,
        formula: "Lateral capacity = 9 × Cu × D × L / 2"
      });
      
      calculationDetails.push({
        description: `Lateral capacity calculation: 9 × ${criticalLayer.cohesion.toFixed(2)} × ${pileDiameter.toFixed(2)} × ${pileLength.toFixed(2)} / 2`,
        value: lateralCapacity,
        result: `${lateralCapacity.toFixed(2)} kN`
      });
    } else {
      // Long pile in clay (bending failure)
      // For long piles, we use a different approach
      const momentCapacity = 9 * criticalLayer.cohesion * Math.pow(pileDiameter, 2) * pileLength;
      lateralCapacity = 4.5 * criticalLayer.cohesion * pileDiameter * Math.sqrt(momentCapacity / (criticalLayer.cohesion * pileDiameter));
      
      calculationDetails.push({
        description: `Moment capacity calculation: 9 × ${criticalLayer.cohesion.toFixed(2)} × ${pileDiameter.toFixed(2)}² × ${pileLength.toFixed(2)}`,
        value: momentCapacity,
        formula: "Moment capacity = 9 × Cu × D² × L"
      });
      
      calculationDetails.push({
        description: `Lateral capacity for long pile in clay`,
        value: lateralCapacity,
        formula: "Lateral capacity = 4.5 × Cu × D × √(M / (Cu × D))",
        result: `${lateralCapacity.toFixed(2)} kN`
      });
    }
  } else {
    // Granular soil (sand)
    calculationMethod = 'Broms\' method for granular soils';
    
    // Calculate passive earth pressure coefficient based on friction angle
    const kp = Math.pow(Math.tan(45 + criticalLayer.frictionAngle/2 * Math.PI/180), 2);
    
    calculationDetails.push({
      description: `Friction angle of critical layer: ${criticalLayer.frictionAngle.toFixed(2)}°`,
      value: criticalLayer.frictionAngle,
      notes: `Passive earth pressure coefficient Kp = ${kp.toFixed(2)}`
    });
    
    if (isPileRigid) {
      // Short pile in sand
      lateralCapacity = 0.5 * effectiveUnitWeight * pileDiameter * Math.pow(pileLength, 3) * kp;
      
      calculationDetails.push({
        description: `Lateral capacity for short pile in sand`,
        formula: "Lateral capacity = 0.5 × γ' × D × L³ × Kp",
        calculation: `0.5 × ${effectiveUnitWeight.toFixed(2)} × ${pileDiameter.toFixed(2)} × ${pileLength.toFixed(2)}³ × ${kp.toFixed(2)}`,
        result: `${lateralCapacity.toFixed(2)} kN`
      });
    } else {
      // Long pile in sand
      const equivalentDepth = 1.8 * pileDiameter * Math.sqrt(kp);
      lateralCapacity = 1.5 * effectiveUnitWeight * pileDiameter * Math.pow(equivalentDepth, 3);
      
      calculationDetails.push({
        description: `Equivalent depth calculation: 1.8 × ${pileDiameter.toFixed(2)} × √${kp.toFixed(2)}`,
        value: equivalentDepth,
        formula: "Equivalent depth = 1.8 × D × √Kp"
      });
      
      calculationDetails.push({
        description: `Lateral capacity for long pile in sand`,
        formula: "Lateral capacity = 1.5 × γ' × D × Le³",
        calculation: `1.5 × ${effectiveUnitWeight.toFixed(2)} × ${pileDiameter.toFixed(2)} × ${equivalentDepth.toFixed(2)}³`,
        result: `${lateralCapacity.toFixed(2)} kN`
      });
    }
  }
  
  // Moment reduction due to force application height (above ground)
  const momentReduction = forceHeight > 0 ? pileLength / (pileLength + forceHeight) : 1.0;
  
  calculationDetails.push({
    description: `Moment reduction factor for force height`,
    formula: "Reduction = L / (L + e)",
    calculation: `${pileLength.toFixed(2)} / (${pileLength.toFixed(2)} + ${forceHeight.toFixed(2)})`,
    value: momentReduction,
    result: `${(momentReduction * 100).toFixed(1)}% of capacity`
  });
  
  lateralCapacity *= momentReduction;
  
  calculationDetails.push({
    description: `Final lateral capacity after height adjustment`,
    calculation: `${(lateralCapacity / momentReduction).toFixed(2)} × ${momentReduction.toFixed(2)}`,
    result: `${lateralCapacity.toFixed(2)} kN`
  });
  
  // Apply safety factor
  const allowableLateralCapacity = lateralCapacity / safetyFactor;
  
  calculationDetails.push({
    description: `Allowable lateral capacity with safety factor`,
    formula: "Allowable capacity = Ultimate capacity / FOS",
    calculation: `${lateralCapacity.toFixed(2)} / ${safetyFactor}`,
    result: `${allowableLateralCapacity.toFixed(2)} kN`
  });
  
  return {
    lateralCapacity,
    allowableLateralCapacity,
    calculationMethod,
    calculationDetails,
    assumptions: [
      `Critical soil layer considered at depth ${criticalDepth.toFixed(1)}m`,
      'Simplified Broms\' method used for lateral capacity estimation',
      `Force application height of ${forceHeight}m reduces capacity by factor of ${momentReduction.toFixed(2)}`,
      `Factor of safety for lateral capacity: ${safetyFactor}`
    ]
  };
};
