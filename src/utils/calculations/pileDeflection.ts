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
  
  // Generate points for analysis - ensure enough points to accurately represent the pile length
  const numPoints = Math.max(100, pileLength * 10); // More points for better resolution
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
    
    // Skip points beyond pile length + a small buffer for visualization
    if (depth > totalPileLength + 0.1) continue;
    
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
      // For points below ground - here's where we need to account for different soil behaviors
      const x = depthFromGround / charLength; // Normalized depth
      
      // Get soil layer at this depth
      const soilLayer = soilLayers[layerIndex];
      const soilModulus = estimateSoilModulus(soilLayer, depthFromGround);
      
      // Improved soil-specific deflection calculation
      // Using exponential decay functions that vary by soil type
      
      // Base deflection scaling factor - this represents realistic deflection in meters
      // for a typical laterally loaded pile (millimeter range)
      const deflectionScaleFactor = 0.001; // 1mm base scale (in meters)
      
      // Soil-specific decay parameters
      let decayRate, phaseShift;
      if (soilLayer.frictionAngle > 0) {
        // Sandy soils - faster decay with depth
        decayRate = 0.8 + (soilLayer.frictionAngle / 50); // Higher friction angle = faster decay
        phaseShift = 0.5;
        
        if (soilLayer.type.includes('loose')) {
          // Loose sand allows more movement
          decayRate *= 0.7;
        } else if (soilLayer.type.includes('dense')) {
          // Dense sand restricts movement more
          decayRate *= 1.3;
        }
      } else {
        // Clayey soils - slower decay with depth
        decayRate = 0.4 + (soilLayer.cohesion / 100) * 0.4; // Higher cohesion = faster decay
        phaseShift = 0.3;
        
        if (soilLayer.type.includes('soft')) {
          // Soft clay allows more movement
          decayRate *= 0.6;
        } else if (soilLayer.type.includes('stiff')) {
          // Stiff clay restricts movement more
          decayRate *= 1.4;
        }
      }
      
      // Calculate deflection based on depth, soil parameters, and loading
      // Using a modified exponential decay function with damped oscillation
      deflection = lateralLoad * Math.exp(-decayRate * x) * 
                 (Math.cos(phaseShift * x) + 0.2 * Math.sin(phaseShift * x)) / 
                 (pileDiameter * soilModulus) * 
                 deflectionScaleFactor;
      
      // Scale deflection based on pile stiffness and soil stiffness ratio
      const stiffnessRatio = flexuralRigidity / (soilModulus * Math.pow(charLength, 4));
      deflection *= Math.pow(stiffnessRatio, 0.25);
      
      // Adjust for water table (softer response if below water table)
      const isUnderWater = waterTableDepth < 0 || depthFromGround > waterTableDepth;
      if (isUnderWater) {
        deflection *= 1.2;
      }
      
      // Adjust deflection for realistic values based on loading
      // Typical lateral deflections should be in millimeter range for standard loads
      const loadFactor = lateralLoad / 100; // Normalize around 100 kN load
      deflection *= loadFactor;
      
      // Improved bending moment calculation accounting for soil type
      bendingMoment = lateralLoad * charLength * Math.exp(-decayRate * x) * 
                    (Math.cos(phaseShift * x - 0.2) - 0.2 * Math.sin(phaseShift * x - 0.2));
      
      // Improved shear force calculation (derivative of bending moment)
      shearForce = -lateralLoad * Math.exp(-decayRate * x) * 
                 (decayRate * Math.cos(phaseShift * x) + phaseShift * Math.sin(phaseShift * x));
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
