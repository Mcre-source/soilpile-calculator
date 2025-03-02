
import { SAFETY_FACTORS } from '../constants';

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
