
import * as XLSX from 'xlsx';

export const exportToExcel = (
  calculationResults: any, 
  structuralCheck: any, 
  lateralResults: any, 
  recommendedPiles: any[],
  soilLayers: any[]
) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create Summary worksheet
  const summaryData = [
    ['SOIL PILE CALCULATOR - CALCULATION REPORT', ''],
    ['', ''],
    ['CALCULATION SUMMARY', ''],
    ['Calculation Method', calculationResults.method],
    ['Date', new Date().toLocaleDateString()],
    ['', ''],
    ['PILE CONFIGURATION', ''],
    ['Diameter', `${calculationResults.pileProperties.diameter.toFixed(2)} m`],
    ['Length', `${calculationResults.pileProperties.length.toFixed(2)} m`],
    ['Material', calculationResults.pileProperties.material],
    ['', ''],
    ['CAPACITY RESULTS', ''],
    ['Required Capacity', `${calculationResults.requiredCapacity.toFixed(2)} kN`],
    ['Total Ultimate Capacity', `${calculationResults.totalCapacity.toFixed(2)} kN`],
    ['Skin Friction', `${calculationResults.skinFriction.toFixed(2)} kN`],
    ['End Bearing', `${calculationResults.endBearing.toFixed(2)} kN`],
    ['Allowable Capacity', `${calculationResults.allowableCapacity.toFixed(2)} kN`],
    ['Safety Factor (Bearing)', calculationResults.appliedSafetyFactor],
    ['', ''],
    ['STRUCTURAL CHECK', ''],
    ['Compressive Stress', `${structuralCheck.compressiveStress.toFixed(2)} MPa`],
    ['Allowable Stress', `${structuralCheck.allowableStress.toFixed(2)} MPa`],
    ['Utilization Ratio', `${(structuralCheck.utilizationRatio * 100).toFixed(1)}%`],
    ['Structural Adequacy', structuralCheck.isAdequate ? 'ADEQUATE' : 'INADEQUATE'],
    ['', ''],
    ['LATERAL CAPACITY', ''],
    ['Allowable Lateral Capacity', `${lateralResults.allowableLateralCapacity.toFixed(2)} kN`],
    ['Calculation Method', lateralResults.calculationMethod],
    ['Force Application Height', `${calculationResults.forceHeight.toFixed(2)} m`],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  
  // Create Soil Profile worksheet
  const soilProfileHeaders = ['Layer', 'Type', 'Thickness (m)', 'Friction Angle (°)', 'Cohesion (kPa)', 'Unit Weight (kN/m³)'];
  const soilProfileRows = soilLayers.map((layer, index) => [
    `Layer ${index + 1}`,
    layer.type.replace('-', ' ').toUpperCase(),
    layer.thickness,
    layer.frictionAngle,
    layer.cohesion,
    layer.unitWeight
  ]);
  
  const soilProfileData = [soilProfileHeaders, ...soilProfileRows];
  const soilProfileSheet = XLSX.utils.aoa_to_sheet(soilProfileData);
  XLSX.utils.book_append_sheet(wb, soilProfileSheet, 'Soil Profile');
  
  // Create Calculation Steps worksheet
  const calculationStepsHeaders = ['Layer Depth', 'Description'];
  const calculationStepsRows = calculationResults.calculationSteps.map((step: any) => [
    step.depth,
    step.description
  ]);
  
  const calculationStepsData = [calculationStepsHeaders, ...calculationStepsRows];
  const calculationStepsSheet = XLSX.utils.aoa_to_sheet(calculationStepsData);
  XLSX.utils.book_append_sheet(wb, calculationStepsSheet, 'Calculation Steps');
  
  // Create Lateral Capacity Calculation worksheet
  if (lateralResults && lateralResults.calculationDetails) {
    const lateralCalcHeaders = ['Description', 'Formula/Calculation', 'Result/Value', 'Notes'];
    const lateralCalcRows = lateralResults.calculationDetails.map((detail: any) => [
      detail.description,
      detail.formula || detail.calculation || '',
      detail.result || detail.value?.toString() || '',
      detail.notes || ''
    ]);
    
    const lateralCalcData = [
      ['LATERAL CAPACITY CALCULATION DETAILS', '', '', ''],
      ['', '', '', ''],
      ['Method:', lateralResults.calculationMethod, '', ''],
      ['Pile Diameter:', `${calculationResults.pileProperties.diameter.toFixed(2)} m`, '', ''],
      ['Pile Length:', `${calculationResults.pileProperties.length.toFixed(2)} m`, '', ''],
      ['Force Height:', `${calculationResults.forceHeight.toFixed(2)} m`, '', ''],
      ['Water Level:', waterLevelText(calculationResults.waterTableDepth), '', ''],
      ['', '', '', ''],
      lateralCalcHeaders,
      ...lateralCalcRows,
      ['', '', '', ''],
      ['FINAL RESULTS', '', '', ''],
      ['Ultimate Lateral Capacity:', `${lateralResults.lateralCapacity.toFixed(2)} kN`, '', ''],
      ['Safety Factor:', `${calculationResults.appliedLateralSafetyFactor}`, '', ''],
      ['Allowable Lateral Capacity:', `${lateralResults.allowableLateralCapacity.toFixed(2)} kN`, '', '']
    ];
    
    const lateralCalcSheet = XLSX.utils.aoa_to_sheet(lateralCalcData);
    
    // Set column widths
    const wscols = [
      {wch: 40}, // Description column width
      {wch: 40}, // Formula column width
      {wch: 15}, // Result column width
      {wch: 30}  // Notes column width
    ];
    lateralCalcSheet['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, lateralCalcSheet, 'Lateral Calculation');
  }
  
  // Create Input Data worksheet
  const inputDataRows = [
    ['INPUT DATA SUMMARY', ''],
    ['', ''],
    ['PILE PROPERTIES', ''],
    ['Material:', calculationResults.pileProperties.material.toUpperCase()],
    ['Diameter:', `${calculationResults.pileProperties.diameter.toFixed(2)} m`],
    ['Length:', `${calculationResults.pileProperties.length.toFixed(2)} m`],
    ['', ''],
    ['LOADING', ''],
    ['Required Lateral Capacity:', `${calculationResults.requiredCapacity.toFixed(2)} kN`],
    ['Force Application Height:', `${calculationResults.forceHeight.toFixed(2)} m`],
    ['', ''],
    ['SITE CONDITIONS', ''],
    ['Water Level:', waterLevelText(calculationResults.waterTableDepth)],
    ['', ''],
    ['SAFETY FACTORS', ''],
    ['Bearing Capacity:', calculationResults.appliedSafetyFactor],
    ['Structural Capacity:', calculationResults.appliedStructuralSafetyFactor],
    ['Lateral Capacity:', calculationResults.appliedLateralSafetyFactor],
  ];
  
  const inputDataSheet = XLSX.utils.aoa_to_sheet(inputDataRows);
  XLSX.utils.book_append_sheet(wb, inputDataSheet, 'Input Data');
  
  // Create Recommendations worksheet
  if (recommendedPiles.length > 0) {
    const recommendationsHeaders = ['Option', 'Diameter (m)', 'Length (m)', 'Allowable Capacity (kN)', 'Structural Utilization (%)', 'Efficiency (%)'];
    const recommendationsRows = recommendedPiles.map((pile, index) => [
      `Option ${index + 1}`,
      pile.diameter.toFixed(2),
      pile.length.toFixed(2),
      pile.allowableCapacity.toFixed(2),
      (pile.utilizationRatio * 100).toFixed(1),
      (pile.efficiency * 100).toFixed(1)
    ]);
    
    const recommendationsData = [recommendationsHeaders, ...recommendationsRows];
    const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
    XLSX.utils.book_append_sheet(wb, recommendationsSheet, 'Recommendations');
  }
  
  // Create Assumptions worksheet
  const assumptionsData = [
    ['CALCULATION ASSUMPTIONS', ''],
    ['', ''],
    ['General Assumptions', ''],
    ['1', 'Pile is assumed to be vertical with no installation deviation'],
    ['2', 'Ground is level with no slope effects'],
    ['3', 'No group effects are considered (single pile analysis)'],
    ['4', 'Static loading conditions are assumed'],
    ['5', 'Soil properties are assumed to be homogeneous within each layer'],
    ['6', 'Water table is assumed to be horizontal'],
    ['', ''],
    ['Method-Specific Assumptions', ''],
  ];
  
  calculationResults.assumptions.forEach((assumption: string, index: number) => {
    assumptionsData.push([`${index + 1}`, assumption]);
  });
  
  if (lateralResults && lateralResults.assumptions) {
    assumptionsData.push(['', '']);
    assumptionsData.push(['Lateral Capacity Assumptions', '']);
    lateralResults.assumptions.forEach((assumption: string, index: number) => {
      assumptionsData.push([`${index + 1}`, assumption]);
    });
  }
  
  assumptionsData.push(['', '']);
  assumptionsData.push(['Safety Factors', '']);
  assumptionsData.push(['Bearing Capacity', calculationResults.appliedSafetyFactor.toString()]);
  assumptionsData.push(['Structural Capacity', calculationResults.appliedStructuralSafetyFactor.toString()]);
  assumptionsData.push(['Lateral Capacity', calculationResults.appliedLateralSafetyFactor.toString()]);
  
  const assumptionsSheet = XLSX.utils.aoa_to_sheet(assumptionsData);
  XLSX.utils.book_append_sheet(wb, assumptionsSheet, 'Assumptions');
  
  // Apply styles to cells
  ['Summary', 'Soil Profile', 'Calculation Steps', 'Lateral Calculation', 'Input Data', 'Recommendations', 'Assumptions'].forEach(sheetName => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;
    
    // Find all cells with headers/titles
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
      const cell = sheet[cellAddress];
      
      if (cell && typeof cell.v === 'string' && 
         (cell.v.toUpperCase() === cell.v || 
          cell.v.includes('SUMMARY') || 
          cell.v.includes('CONFIGURATION') || 
          cell.v.includes('RESULTS') || 
          cell.v.includes('CHECK') || 
          cell.v.includes('CAPACITY') || 
          cell.v.includes('ASSUMPTIONS') ||
          cell.v.includes('INPUT DATA') ||
          cell.v.includes('FINAL'))) {
        
        // This is likely a header or title - set bold
        if (!cell.s) cell.s = {};
        cell.s.font = { bold: true };
      }
    }
  });
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'Soil_Pile_Calculation_Report.xlsx');
  
  return true;
};

// Helper function to format water level text
function waterLevelText(waterTableDepth: number): string {
  if (waterTableDepth < 0) {
    return `${Math.abs(waterTableDepth).toFixed(1)} m above ground`;
  } else if (waterTableDepth === 0) {
    return 'At ground level';
  } else {
    return `${waterTableDepth.toFixed(1)} m below ground`;
  }
}
