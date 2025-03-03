import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Ruler } from 'lucide-react';
import { SAFETY_FACTORS } from '../utils/constants';
import DeflectionCharts from './DeflectionCharts';

interface CalculationResultsProps {
  calculationResults: any;
  structuralCheck: any;
  lateralResults: any;
  recommendedPiles: any[];
  deflectionData: any;
}

export default function CalculationResults({ 
  calculationResults, 
  structuralCheck, 
  lateralResults,
  recommendedPiles,
  deflectionData
}: CalculationResultsProps) {
  
  // Format number with units
  const formatNumber = (value: number, units: string, decimals = 2) => {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${units}`;
  };
  
  // Convert utilization ratio to percentage
  const utilizationPercent = useMemo(() => {
    return Math.min(structuralCheck.utilizationRatio * 100, 100);
  }, [structuralCheck]);
  
  // Check if utilization is OK, warning, or critical
  const getUtilizationStatus = (ratio: number) => {
    if (ratio <= 0.7) return { status: 'success', text: 'Adequate', icon: <CheckCircle className="h-4 w-4" /> };
    if (ratio <= 1.0) return { status: 'warning', text: 'Acceptable', icon: <AlertCircle className="h-4 w-4" /> };
    return { status: 'danger', text: 'Inadequate', icon: <XCircle className="h-4 w-4" /> };
  };
  
  const utilizationStatus = useMemo(() => {
    return getUtilizationStatus(structuralCheck.utilizationRatio);
  }, [structuralCheck]);
  
  // Calculate capacity utilization
  const capacityUtilization = useMemo(() => {
    return calculationResults.requiredCapacity / calculationResults.allowableCapacity * 100;
  }, [calculationResults]);
  
  const capacityStatus = useMemo(() => {
    const ratio = calculationResults.requiredCapacity / calculationResults.allowableCapacity;
    return getUtilizationStatus(ratio);
  }, [calculationResults]);
  
  // Calculate lateral capacity utilization
  const lateralUtilization = useMemo(() => {
    // Using a placeholder value since lateral load is not explicitly defined
    // In a real application, this would be the actual lateral load / lateral capacity
    return 50; // Assuming 50% utilization for demonstration
  }, [lateralResults]);

  return (
    <div className="space-y-6 fade-in">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Calculation Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  Axial Capacity
                  <Badge variant={capacityStatus.status === 'success' ? "default" : capacityStatus.status === 'warning' ? "outline" : "destructive"}>
                    {capacityStatus.text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Required Capacity:</span>
                      <span className="font-medium">{formatNumber(calculationResults.requiredCapacity, 'kN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Allowable Capacity:</span>
                      <span className="font-medium">{formatNumber(calculationResults.allowableCapacity, 'kN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Factor of Safety:</span>
                      <span className="font-medium">{calculationResults.appliedSafetyFactor}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Capacity Utilization:</span>
                      <span className="font-medium">{Math.min(capacityUtilization, 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(capacityUtilization, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  Structural Capacity
                  <Badge variant={utilizationStatus.status === 'success' ? "default" : utilizationStatus.status === 'warning' ? "outline" : "destructive"}>
                    {utilizationStatus.text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compressive Stress:</span>
                      <span className="font-medium">{formatNumber(structuralCheck.compressiveStress, 'MPa')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Allowable Stress:</span>
                      <span className="font-medium">{formatNumber(structuralCheck.allowableStress, 'MPa')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cross-Sectional Area:</span>
                      <span className="font-medium">{formatNumber(structuralCheck.crossSectionalArea, 'm²')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Stress Utilization:</span>
                      <span className="font-medium">{utilizationPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={utilizationPercent} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pile Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Diameter</p>
                  <p className="text-xl font-semibold">{calculationResults.pileProperties.diameter.toFixed(2)} m</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Length</p>
                  <p className="text-xl font-semibold">{calculationResults.pileProperties.length.toFixed(2)} m</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Material</p>
                  <p className="text-xl font-semibold capitalize">{calculationResults.pileProperties.material}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="text-lg font-semibold">{calculationResults.method.split(' ')[0]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lateral Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Allowable Lateral Capacity:</span>
                    <span className="font-medium">{formatNumber(lateralResults.allowableLateralCapacity, 'kN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Calculation Method:</span>
                    <span className="font-medium">{lateralResults.calculationMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Force Application Height:</span>
                    <span className="font-medium">{formatNumber(calculationResults.forceHeight, 'm')}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Lateral Utilization (estimated):</span>
                    <span className="font-medium">{lateralUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={lateralUtilization} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Actual lateral utilization depends on applied lateral load
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {deflectionData && (
            <DeflectionCharts deflectionData={deflectionData} />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Structural Capacity Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{structuralCheck.notes}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Stress Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Applied Axial Load:</span>
                        <span className="font-medium">{formatNumber(calculationResults.requiredCapacity * calculationResults.appliedSafetyFactor, 'kN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cross-sectional Area:</span>
                        <span className="font-medium">{formatNumber(structuralCheck.crossSectionalArea, 'm²')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compressive Stress:</span>
                        <span className="font-medium">{formatNumber(structuralCheck.compressiveStress, 'MPa')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allowable Stress:</span>
                        <span className="font-medium">{formatNumber(structuralCheck.allowableStress, 'MPa')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Material Properties</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Material:</span>
                        <span className="font-medium capitalize">{calculationResults.pileProperties.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yield Strength:</span>
                        <span className="font-medium">{formatNumber(calculationResults.pileProperties.materialProperties.yield_strength, 'MPa')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Elastic Modulus:</span>
                        <span className="font-medium">{formatNumber(calculationResults.pileProperties.materialProperties.elasticity, 'MPa')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Factor:</span>
                        <span className="font-medium">{calculationResults.appliedSafetyFactor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Pile Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedPiles.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    Based on your soil profile and required capacity, these pile configurations are recommended:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedPiles.map((pile, index) => (
                      <div key={index} className={`p-4 border rounded-md ${index === 0 ? 'border-primary' : 'border-muted'}`}>
                        {index === 0 && (
                          <Badge className="mb-2">Recommended</Badge>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Ruler className="h-4 w-4" />
                          <h3 className="font-semibold">Option {index + 1}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Diameter:</span>
                            <span className="font-medium">{pile.diameter.toFixed(2)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Length:</span>
                            <span className="font-medium">{pile.length.toFixed(2)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Capacity:</span>
                            <span className="font-medium">{formatNumber(pile.allowableCapacity, 'kN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span className="font-medium">{(pile.utilizationRatio * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Efficiency:</span>
                            <span className="font-medium">{(pile.efficiency * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    Note: Recommendations prioritize efficient material use while maintaining adequate safety margins.
                    The most efficient option is listed first. Efficiency indicates how closely the pile capacity matches the required capacity.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recommendations available with current parameters.</p>
                  <p className="text-sm mt-2">Try adjusting the soil profile or required capacity.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Design Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Consider these factors when finalizing your pile design:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Installation Considerations</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Verify availability of installation equipment for the selected pile dimensions</li>
                      <li>Consider site constraints and access for the equipment</li>
                      <li>Check for potential obstructions or buried utilities</li>
                      <li>Evaluate noise and vibration constraints during installation</li>
                      <li>Plan for material supply logistics</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Additional Engineering Checks</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Conduct settlement analysis for long-term performance</li>
                      <li>Evaluate group effects if multiple piles are used</li>
                      <li>Check for negative skin friction in areas with fill or soft soils</li>
                      <li>Consider cyclic loading effects if applicable</li>
                      <li>Verify pile performance under seismic conditions if required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assumptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">General Assumptions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pile is assumed to be vertical with no installation deviation</li>
                    <li>Ground is level with no slope effects</li>
                    <li>No group effects are considered (single pile analysis)</li>
                    <li>Static loading conditions are assumed</li>
                    <li>Soil properties are assumed to be homogeneous within each layer</li>
                    <li>Water table is assumed to be horizontal</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Method-Specific Assumptions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {calculationResults.assumptions.map((assumption: string, index: number) => (
                      <li key={index}>{assumption}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Safety Factors</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Bearing Capacity:</span>
                      <span className="font-medium">{calculationResults.appliedSafetyFactor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Structural Capacity:</span>
                      <span className="font-medium">{calculationResults.appliedStructuralSafetyFactor || SAFETY_FACTORS.structural}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lateral Capacity:</span>
                      <span className="font-medium">{calculationResults.appliedLateralSafetyFactor || SAFETY_FACTORS.sliding}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">Limitations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>This calculator provides preliminary design guidance only and is not a substitute for professional engineering judgment</li>
                    <li>Detailed geotechnical investigation is recommended for final design</li>
                    <li>Simplified calculation methods are used and may not capture all site-specific conditions</li>
                    <li>Local building codes and standards should be consulted for specific safety factor requirements</li>
                    <li>Results should be verified with more detailed analysis for critical projects</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
