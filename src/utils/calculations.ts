
import { SAFETY_FACTORS } from './constants';

// Calculate ultimate bearing capacity using the alpha method (for cohesive soils)
export const calculateAlphaMethod = (
  soilLayers: any[],
  pileProperties: any,
  waterTableDepth: number
) => {
  let totalCapacity = 0;
  let skinFriction = 0;
  let endBearing = 0;
  let calculationSteps = [];
  
  // Pile geometry
  const pileLength = pileProperties.length;
  const pileDiameter = pileProperties.diameter;
  const pileRadius = pileDiameter / 2;
  const pileArea = Math.PI * Math.pow(pileRadius, 2);
  const pilePerimeter = Math.PI * pileDiameter;
  
  let currentDepth = 0;
  let bottomLayerIndex = 0;
  
  // Find which layer contains the pile tip
  for (let i = 0; i < soilLayers.length; i++) {
    if (currentDepth + soilLayers[i].thickness >= pileLength) {
      bottomLayerIndex = i;
      break;
    }
    currentDepth += soilLayers[i].thickness;
  }
  
  // Calculate skin friction along the pile
  currentDepth = 0;
  for (let i = 0; i < soilLayers.length; i++) {
    const layer = soilLayers[i];
    const layerThickness = layer.thickness;
    
    // Skip if the current depth is already beyond the pile length
    if (currentDepth >= pileLength) break;
    
    // Calculate the actual thickness of the layer that interacts with the pile
    const effectiveThickness = Math.min(layerThickness, pileLength - currentDepth);
    
    // Calculate average effective vertical stress in the layer
    const isUnderWater = waterTableDepth < 0 || currentDepth > waterTableDepth;
    const effectiveUnitWeight = isUnderWater ? layer.unitWeight - 9.81 : layer.unitWeight;
    const avgDepth = currentDepth + effectiveThickness / 2;
    const effectiveStress = avgDepth * effectiveUnitWeight;
    
    // Alpha factor depends on soil type and undrained shear strength
    let alpha = 0;
    if (layer.cohesion > 0) {
      // For clays, alpha typically ranges from 0.2 to 1.0
      alpha = layer.cohesion > 100 ? 0.5 : 0.9; // Simplified alpha selection
    } else {
      // For granular soils, use friction angle instead
      alpha = Math.tan(layer.frictionAngle * Math.PI / 180) * 0.8; // K * tan(δ)
    }
    
    // Calculate skin friction for this layer
    const layerSkinFriction = alpha * layer.cohesion * pilePerimeter * effectiveThickness;
    skinFriction += layerSkinFriction;
    
    calculationSteps.push({
      depth: `${currentDepth.toFixed(1)}m - ${(currentDepth + effectiveThickness).toFixed(1)}m`,
      layer: layer.type,
      alpha: alpha.toFixed(2),
      cohesion: layer.cohesion,
      friction: layerSkinFriction.toFixed(2),
      description: `Alpha = ${alpha.toFixed(2)}, Skin friction = ${layerSkinFriction.toFixed(2)} kN`
    });
    
    currentDepth += layerThickness;
  }
  
  // Calculate end bearing
  const bottomLayer = soilLayers[bottomLayerIndex];
  if (bottomLayer.cohesion > 0) {
    // For cohesive soils (clays)
    endBearing = 9 * bottomLayer.cohesion * pileArea;
    calculationSteps.push({
      depth: `${pileLength.toFixed(1)}m (Pile Tip)`,
      layer: bottomLayer.type,
      description: `End bearing = 9 × Cu × Area = 9 × ${bottomLayer.cohesion} × ${pileArea.toFixed(2)} = ${endBearing.toFixed(2)} kN`
    });
  } else {
    // For granular soils (sands), Meyerhof's method
    const nq = Math.exp(Math.PI * Math.tan(bottomLayer.frictionAngle * Math.PI / 180)) * 
               Math.pow(Math.tan(45 + bottomLayer.frictionAngle/2 * Math.PI / 180), 2);
    
    const isUnderWater = waterTableDepth < 0 || pileLength > waterTableDepth;
    const effectiveUnitWeight = isUnderWater ? bottomLayer.unitWeight - 9.81 : bottomLayer.unitWeight;
    const effectiveStress = pileLength * effectiveUnitWeight;
    
    endBearing = nq * effectiveStress * pileArea;
    calculationSteps.push({
      depth: `${pileLength.toFixed(1)}m (Pile Tip)`,
      layer: bottomLayer.type,
      description: `End bearing = Nq × σ'v × Area = ${nq.toFixed(2)} × ${effectiveStress.toFixed(2)} × ${pileArea.toFixed(2)} = ${endBearing.toFixed(2)} kN`
    });
  }
  
  // Total ultimate capacity
  totalCapacity = skinFriction + endBearing;
  const allowableCapacity = totalCapacity / SAFETY_FACTORS.bearing;
  
  return {
    skinFriction,
    endBearing,
    totalCapacity,
    allowableCapacity,
    calculationSteps,
    method: 'Alpha Method (Total Stress)',
    assumptions: [
      'Alpha factors were estimated based on soil cohesion values',
      'End bearing calculation uses Meyerhof\'s method for granular soils and Nc=9 for cohesive soils',
      `Factor of safety for bearing capacity: ${SAFETY_FACTORS.bearing} (default, can be overridden)`
    ]
  };
};

// Calculate ultimate bearing capacity using the beta method (for granular soils)
export const calculateBetaMethod = (
  soilLayers: any[],
  pileProperties: any,
  waterTableDepth: number
) => {
  let totalCapacity = 0;
  let skinFriction = 0;
  let endBearing = 0;
  let calculationSteps = [];
  
  // Pile geometry
  const pileLength = pileProperties.length;
  const pileDiameter = pileProperties.diameter;
  const pileRadius = pileDiameter / 2;
  const pileArea = Math.PI * Math.pow(pileRadius, 2);
  const pilePerimeter = Math.PI * pileDiameter;
  
  let currentDepth = 0;
  let bottomLayerIndex = 0;
  
  // Find which layer contains the pile tip
  for (let i = 0; i < soilLayers.length; i++) {
    if (currentDepth + soilLayers[i].thickness >= pileLength) {
      bottomLayerIndex = i;
      break;
    }
    currentDepth += soilLayers[i].thickness;
  }
  
  // Calculate skin friction along the pile
  currentDepth = 0;
  for (let i = 0; i < soilLayers.length; i++) {
    const layer = soilLayers[i];
    const layerThickness = layer.thickness;
    
    // Skip if the current depth is already beyond the pile length
    if (currentDepth >= pileLength) break;
    
    // Calculate the actual thickness of the layer that interacts with the pile
    const effectiveThickness = Math.min(layerThickness, pileLength - currentDepth);
    
    // Calculate average effective vertical stress in the layer
    const isUnderWater = waterTableDepth < 0 || currentDepth > waterTableDepth;
    const effectiveUnitWeight = isUnderWater ? layer.unitWeight - 9.81 : layer.unitWeight;
    const avgDepth = currentDepth + effectiveThickness / 2;
    const effectiveStress = avgDepth * effectiveUnitWeight;
    
    // Beta factor calculation
    // For granular soils: β = K * tan(φ)
    // K is the coefficient of lateral earth pressure (typically 0.7-1.2 for driven piles)
    const K = 0.8; // Assuming a typical value for driven piles
    let beta = 0;
    
    if (layer.frictionAngle > 0) {
      // For granular soils
      beta = K * Math.tan(layer.frictionAngle * Math.PI / 180);
    } else {
      // For cohesive soils in effective stress analysis
      beta = 0.25; // Typical value for normally consolidated clays
    }
    
    // Calculate skin friction for this layer
    const layerSkinFriction = beta * effectiveStress * pilePerimeter * effectiveThickness;
    skinFriction += layerSkinFriction;
    
    calculationSteps.push({
      depth: `${currentDepth.toFixed(1)}m - ${(currentDepth + effectiveThickness).toFixed(1)}m`,
      layer: layer.type,
      beta: beta.toFixed(2),
      effectiveStress: effectiveStress.toFixed(2),
      friction: layerSkinFriction.toFixed(2),
      description: `Beta = ${beta.toFixed(2)}, Effective stress = ${effectiveStress.toFixed(2)} kPa, Skin friction = ${layerSkinFriction.toFixed(2)} kN`
    });
    
    currentDepth += layerThickness;
  }
  
  // Calculate end bearing
  const bottomLayer = soilLayers[bottomLayerIndex];
  const isUnderWater = waterTableDepth < 0 || pileLength > waterTableDepth;
  const effectiveUnitWeight = isUnderWater ? bottomLayer.unitWeight - 9.81 : bottomLayer.unitWeight;
  const effectiveStress = pileLength * effectiveUnitWeight;
  
  if (bottomLayer.frictionAngle > 0) {
    // For granular soils, use bearing capacity factors
    const phi = bottomLayer.frictionAngle * Math.PI / 180; // Convert to radians
    const nq = Math.exp(Math.PI * Math.tan(phi)) * Math.pow(Math.tan(45 + phi/2), 2);
    
    endBearing = nq * effectiveStress * pileArea;
    calculationSteps.push({
      depth: `${pileLength.toFixed(1)}m (Pile Tip)`,
      layer: bottomLayer.type,
      description: `End bearing = Nq × σ'v × Area = ${nq.toFixed(2)} × ${effectiveStress.toFixed(2)} × ${pileArea.toFixed(2)} = ${endBearing.toFixed(2)} kN`
    });
  } else {
    // For cohesive soils in effective stress analysis
    endBearing = 9 * bottomLayer.cohesion * pileArea;
    calculationSteps.push({
      depth: `${pileLength.toFixed(1)}m (Pile Tip)`,
      layer: bottomLayer.type,
      description: `End bearing = 9 × Cu × Area = 9 × ${bottomLayer.cohesion} × ${pileArea.toFixed(2)} = ${endBearing.toFixed(2)} kN`
    });
  }
  
  // Total ultimate capacity
  totalCapacity = skinFriction + endBearing;
  const allowableCapacity = totalCapacity / SAFETY_FACTORS.bearing;
  
  return {
    skinFriction,
    endBearing,
    totalCapacity,
    allowableCapacity,
    calculationSteps,
    method: 'Beta Method (Effective Stress)',
    assumptions: [
      'Coefficient of lateral earth pressure K = 0.8 was assumed for the calculation',
      'Beta values were calculated based on effective friction angles',
      'End bearing calculation uses bearing capacity factors derived from friction angles',
      `Factor of safety for bearing capacity: ${SAFETY_FACTORS.bearing} (default, can be overridden)`
    ]
  };
};

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

// Calculate pile deflection, bending moment, and shear force
export const calculatePileDeflection = (
  soilLayers: any[],
  pileProperties: any,
  waterTableDepth: number,
  forceHeight: number,
  lateralLoad: number,
  pileTopElevation: number
) => {
  const pileDiameter = pileProperties.diameter;
  const pileLength = pileProperties.length;
  const totalPileLength = pileLength + pileTopElevation; // Include portion above ground
  
  // Calculate pile stiffness (EI)
  let momentOfInertia;
  
  if (pileProperties.material === 'steel' && pileProperties.wallThickness) {
    // For steel tubular piles
    const outerRadius = pileDiameter / 2;
    const innerRadius = outerRadius - pileProperties.wallThickness;
    momentOfInertia = Math.PI * (Math.pow(outerRadius, 4) - Math.pow(innerRadius, 4)) / 4;
  } else {
    // For solid piles
    momentOfInertia = Math.PI * Math.pow(pileDiameter / 2, 4) / 4;
  }
  
  const elasticModulus = pileProperties.materialProperties.elasticity * 1000; // Convert MPa to kPa
  const flexuralRigidity = elasticModulus * momentOfInertia;
  
  // Estimate soil modulus of subgrade reaction based on soil type
  // This is a simplified approach - in practice, this would be more complex
  const estimateSoilModulus = (layer: any, depth: number) => {
    let soilModulus;
    
    const isUnderWater = waterTableDepth < 0 || depth > waterTableDepth;
    const effectiveUnitWeight = isUnderWater ? layer.unitWeight - 9.81 : layer.unitWeight;
    
    if (layer.frictionAngle > 0) {
      // For sandy soils, modulus increases with depth
      // Simplified correlation from literature
      soilModulus = 10000 + 1000 * depth * Math.pow(layer.frictionAngle / 30, 2);
      
      // Adjust for density
      if (layer.type.includes('loose')) soilModulus *= 0.6;
      if (layer.type.includes('dense')) soilModulus *= 1.5;
    } else {
      // For clayey soils, modulus depends on cohesion
      soilModulus = 200 * layer.cohesion;
      
      // Adjust for stiffness
      if (layer.type.includes('soft')) soilModulus *= 0.7;
      if (layer.type.includes('stiff')) soilModulus *= 1.3;
    }
    
    return soilModulus; // kPa
  };
  
  // Generate points for analysis
  const numPoints = 100;
  const depthIncrement = totalPileLength / (numPoints - 1);
  
  // Initialize arrays for results
  const deflectionResults = [];
  const bendingMomentResults = [];
  const shearForceResults = [];
  
  // Simplified p-y curve method for lateral deflection
  // This is an approximation - a real p-y analysis would be more complex
  
  // First, determine the characteristic length
  let avgSoilModulus = 0;
  let currentDepth = 0;
  
  // Calculate average soil modulus along the pile
  for (let i = 0; i < soilLayers.length; i++) {
    const layer = soilLayers[i];
    const layerThickness = layer.thickness;
    
    // Skip if the current depth is already beyond the pile length
    if (currentDepth >= pileLength) break;
    
    // Calculate the actual thickness of the layer that interacts with the pile
    const effectiveThickness = Math.min(layerThickness, pileLength - currentDepth);
    const layerMidDepth = currentDepth + effectiveThickness / 2;
    
    avgSoilModulus += estimateSoilModulus(layer, layerMidDepth) * effectiveThickness / pileLength;
    
    currentDepth += layerThickness;
  }
  
  // Calculate characteristic length
  const charLength = Math.pow(flexuralRigidity / (pileDiameter * avgSoilModulus), 0.25);
  
  // Calculate deflection, bending moment, and shear force at each point
  for (let i = 0; i < numPoints; i++) {
    const depth = i * depthIncrement;
    let deflection, bendingMoment, shearForce;
    
    // Depth from ground surface (negative above ground)
    const depthFromGround = depth - pileTopElevation;
    
    // Find which soil layer contains this point
    let layerIndex = 0;
    let accumulatedThickness = 0;
    
    if (depthFromGround > 0) {
      for (let j = 0; j < soilLayers.length; j++) {
        if (accumulatedThickness + soilLayers[j].thickness > depthFromGround) {
          layerIndex = j;
          break;
        }
        accumulatedThickness += soilLayers[j].thickness;
      }
    }
    
    // For points above ground
    if (depthFromGround <= 0) {
      // Simplified cantilever behavior above ground
      const x = pileTopElevation - depth; // Distance from ground
      
      // Adjust force application point
      const effectiveForceHeight = forceHeight - x;
      
      if (effectiveForceHeight >= 0) {
        // Point above force application
        deflection = lateralLoad * Math.pow(effectiveForceHeight, 3) / (3 * flexuralRigidity);
        bendingMoment = lateralLoad * effectiveForceHeight;
        shearForce = lateralLoad;
      } else {
        // Point below force application but above ground
        deflection = lateralLoad * Math.pow(forceHeight, 3) / (3 * flexuralRigidity);
        bendingMoment = 0;
        shearForce = 0;
      }
    } else {
      // For points below ground
      const x = depthFromGround / charLength; // Normalized depth
      
      // Get soil layer at this depth
      const soilLayer = soilLayers[layerIndex];
      const soilModulus = estimateSoilModulus(soilLayer, depthFromGround);
      
      // Simplified solutions based on elastic beam on elastic foundation
      // These are approximations using characteristic patterns
      
      // Estimate deflection using exponential decay
      deflection = lateralLoad * Math.exp(-0.6 * x) * Math.cos(0.6 * x) / (2 * pileDiameter * soilModulus);
      
      // Bending moment approximation
      bendingMoment = lateralLoad * charLength * Math.exp(-0.5 * x) * 
                      (Math.cos(0.5 * x - 0.2) - 0.2 * Math.sin(0.5 * x - 0.2));
      
      // Shear force approximation (derivative of bending moment)
      shearForce = -lateralLoad * Math.exp(-0.5 * x) * Math.sin(0.5 * x);
    }
    
    // Apply load and height effects
    const totalForceHeight = forceHeight + pileTopElevation;
    
    if (forceHeight > 0) {
      // Additional moment effect from height
      bendingMoment += lateralLoad * Math.max(0, totalForceHeight - depth);
    }
    
    // Store results
    deflectionResults.push({ depth, value: deflection });
    bendingMomentResults.push({ depth, value: bendingMoment });
    shearForceResults.push({ depth, value: shearForce });
  }
  
  // Find maximum values
  const maxDeflection = Math.max(...deflectionResults.map(p => Math.abs(p.value)));
  const maxBendingMoment = Math.max(...bendingMomentResults.map(p => Math.abs(p.value)));
  const maxShearForce = Math.max(...shearForceResults.map(p => Math.abs(p.value)));
  
  return {
    deflection: deflectionResults,
    bendingMoment: bendingMomentResults,
    shearForce: shearForceResults,
    maxDeflection: maxDeflection,
    maxBendingMoment: maxBendingMoment,
    maxShearForce: maxShearForce,
    characteristicLength: charLength,
    pileStiffness: flexuralRigidity,
    averageSoilModulus: avgSoilModulus
  };
};
