
import { useState, useEffect } from 'react';
import { SOIL_TYPES, DEFAULT_SOIL_LAYER, PILE_MATERIALS, STANDARD_PILE_DIAMETERS, SAFETY_FACTORS } from '../utils/constants';
import { calculateAlphaMethod, calculateBetaMethod, checkStructuralCapacity, recommendPileDimensions, calculateLateralCapacity } from '../utils/calculations';
import { exportToExcel } from '../utils/excelExport';
import SoilLayerInput from '../components/SoilLayerInput';
import PileInput from '../components/PileInput';
import CalculationResults from '../components/CalculationResults';
import SoilProfileVisualization from '../components/SoilProfileVisualization';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CalculatorIcon, ChevronDown, ChevronUp, Shield, FileDown, MoveHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define a more specific type for pile properties to include optional fields
interface PileProperties {
  material: string;
  materialProperties: any; // Keep as any for simplicity
  diameter: number;
  length: number;
  wallThickness?: number; // Optional wall thickness for steel piles
  compositeMaterials?: {
    material1: string;
    material2: string;
  };
}

const Index = () => {
  const { toast } = useToast();

  // State for soil profile
  const [soilLayers, setSoilLayers] = useState([
    { ...DEFAULT_SOIL_LAYER, thickness: 3 },
    { ...DEFAULT_SOIL_LAYER, type: 'sand-dense', thickness: 5, frictionAngle: 38, cohesion: 0, unitWeight: 20 },
    { ...DEFAULT_SOIL_LAYER, type: 'clay-medium', thickness: 10, frictionAngle: 0, cohesion: 50, unitWeight: 17 }
  ]);

  // State for pile properties with proper type
  const [pileProperties, setPileProperties] = useState<PileProperties>({
    material: 'concrete',
    materialProperties: PILE_MATERIALS[0],
    diameter: 0.6,
    length: 15
  });

  // State for pile top elevation
  const [pileTopElevation, setPileTopElevation] = useState(0);

  // State for pile auto-length calculation
  const [autoLength, setAutoLength] = useState(false);

  // State for calculation inputs
  const [requiredCapacity, setRequiredCapacity] = useState(100); // Default lower for lateral load
  const [waterTableDepth, setWaterTableDepth] = useState(5);
  const [forceHeight, setForceHeight] = useState(0);
  const [calculationMethod, setCalculationMethod] = useState('beta');
  
  // State for safety factor (simplified to a single factor for soil parameters)
  const [soilSafetyFactor, setSoilSafetyFactor] = useState(1.5);
  const [structuralSafetyFactor, setStructuralSafetyFactor] = useState(SAFETY_FACTORS.structural);

  // State for calculation results
  const [calculationResults, setCalculationResults] = useState(null);
  const [structuralCheck, setStructuralCheck] = useState(null);
  const [lateralResults, setLateralResults] = useState(null);
  const [recommendedPiles, setRecommendedPiles] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Calculate optimal pile length if auto-length is enabled
  useEffect(() => {
    if (autoLength && pileProperties.diameter && requiredCapacity > 0) {
      // Calculate the optimal pile length for the given diameter and required capacity
      // For lateral capacity, we'll use a different approach
      const tryLengths = [5, 7.5, 10, 12.5, 15, 17.5, 20];
      let recommendedLength = 20; // Default to maximum
      
      // Try different lengths and find the shortest one that works
      for (const length of tryLengths) {
        const testPileProps = { ...pileProperties, length };
        const lateralCapacityResults = calculateLateralCapacity(
          soilLayers,
          testPileProps,
          waterTableDepth,
          forceHeight,
          soilSafetyFactor
        );
        
        if (lateralCapacityResults.allowableLateralCapacity >= requiredCapacity) {
          recommendedLength = length;
          break;
        }
      }
      
      setPileProperties(prev => ({ ...prev, length: recommendedLength }));
    }
  }, [autoLength, pileProperties.diameter, pileProperties.material, requiredCapacity, soilLayers, waterTableDepth, forceHeight, soilSafetyFactor]);

  // Ensure force height doesn't exceed pile top elevation
  useEffect(() => {
    if (forceHeight > pileTopElevation) {
      setForceHeight(pileTopElevation);
    }
  }, [pileTopElevation, forceHeight]);

  // Calculate results
  const calculateResults = () => {
    try {
      // Validate inputs
      if (soilLayers.length === 0) {
        toast({
          title: "Error",
          description: "At least one soil layer is required",
          variant: "destructive"
        });
        return;
      }

      if (requiredCapacity <= 0) {
        toast({
          title: "Error",
          description: "Required capacity must be greater than zero",
          variant: "destructive"
        });
        return;
      }

      // Validate safety factors
      if (soilSafetyFactor < 1 || structuralSafetyFactor < 1) {
        toast({
          title: "Error",
          description: "Safety factors must be greater than or equal to 1.0",
          variant: "destructive"
        });
        return;
      }

      // Perform calculations for lateral capacity
      const lateralCapacityResults = calculateLateralCapacity(
        soilLayers,
        pileProperties,
        waterTableDepth,
        forceHeight,
        soilSafetyFactor
      );

      // Generate placeholder results (no axial load applied)
      const results = {
        totalCapacity: 0, // No axial load
        skinFriction: 0,  // No skin friction for lateral load
        endBearing: 0,    // No end bearing for lateral load
        allowableCapacity: 0, // No axial capacity for lateral load
        calculationMethod: "Broms' Method for Lateral Loading",
        notes: "This analysis considers lateral loading only. No axial load is applied.",
        pileProperties: pileProperties,
        requiredCapacity: requiredCapacity,
        waterTableDepth: waterTableDepth,
        forceHeight: forceHeight,
        pileTopElevation: pileTopElevation,
        appliedSafetyFactor: soilSafetyFactor,
        appliedStructuralSafetyFactor: structuralSafetyFactor
      };

      // For a laterally loaded pile, we'll check bending stress
      // This is a simplified calculation
      const moment = requiredCapacity * (forceHeight + pileProperties.length / 3);
      
      // Calculate moment of inertia based on pile type
      let momentOfInertia;
      let maxFiberDistance;
      
      if (pileProperties.material === 'steel' && pileProperties.wallThickness) {
        // For tubular steel piles
        const outerRadius = pileProperties.diameter / 2;
        const innerRadius = outerRadius - pileProperties.wallThickness;
        momentOfInertia = Math.PI * (Math.pow(outerRadius, 4) - Math.pow(innerRadius, 4)) / 4;
        maxFiberDistance = outerRadius;
      } else {
        // For solid piles
        momentOfInertia = Math.PI * Math.pow(pileProperties.diameter/2, 4) / 4;
        maxFiberDistance = pileProperties.diameter / 2;
      }
      
      const bendingStress = (moment * maxFiberDistance) / momentOfInertia / 1000; // MPa
      
      const allowableBendingStress = pileProperties.materialProperties.yield_strength / structuralSafetyFactor;
      const utilizationRatio = bendingStress / allowableBendingStress;

      // Create a structural check result
      const structuralResults = {
        crossSectionalArea: pileProperties.material === 'steel' && pileProperties.wallThickness
          ? Math.PI * ((pileProperties.diameter/2)** 2 - (pileProperties.diameter/2 - pileProperties.wallThickness) ** 2)
          : Math.PI * Math.pow(pileProperties.diameter/2, 2),
        compressiveStress: bendingStress, // Using bending stress instead for lateral load
        allowableStress: allowableBendingStress,
        utilizationRatio: utilizationRatio,
        isAdequate: utilizationRatio <= 1.0,
        notes: utilizationRatio <= 0.7 
          ? "The pile has sufficient structural capacity for bending with a good safety margin."
          : utilizationRatio <= 1.0 
            ? "The pile has adequate structural capacity for bending, but consider increasing the size for better long-term performance."
            : "The pile is structurally inadequate for the applied lateral load. Increase the pile dimensions."
      };

      // Generate recommendations for lateral capacity
      const recommendations = recommendPileDimensions(
        requiredCapacity,
        soilLayers,
        waterTableDepth,
        pileProperties.materialProperties,
        soilSafetyFactor,
        structuralSafetyFactor
      );

      console.log("Calculation completed successfully");
      console.log("Lateral results:", lateralCapacityResults);
      console.log("Structural check:", structuralResults);

      // Update state with results
      setCalculationResults(results);
      setStructuralCheck(structuralResults);
      setLateralResults(lateralCapacityResults);
      setRecommendedPiles(recommendations);
      setShowResults(true);

      // Show success toast
      toast({
        title: "Calculation completed",
        description: "Pile calculation results are ready",
      });

      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation error",
        description: "An error occurred during the calculation. Please check the input values.",
        variant: "destructive"
      });
    }
  };

  const handleExportToExcel = () => {
    if (!calculationResults || !structuralCheck || !lateralResults) {
      toast({
        title: "Error",
        description: "Please complete a calculation before exporting",
        variant: "destructive"
      });
      return;
    }

    try {
      exportToExcel(calculationResults, structuralCheck, lateralResults, recommendedPiles, soilLayers);
      
      toast({
        title: "Export successful",
        description: "Calculation report has been exported to Excel",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the calculation report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalculatorIcon className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-semibold text-gray-900">Lateral Pile Calculator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
                  <Tabs defaultValue="soil" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="soil">Soil Profile</TabsTrigger>
                      <TabsTrigger value="pile">Pile Properties</TabsTrigger>
                      <TabsTrigger value="safety">Safety Factors</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="soil" className="space-y-4">
                      <SoilLayerInput soilLayers={soilLayers} setSoilLayers={setSoilLayers} />
                    </TabsContent>
                    
                    <TabsContent value="pile" className="space-y-4">
                      <PileInput 
                        pileProperties={pileProperties}
                        setPileProperties={setPileProperties}
                        requiredCapacity={requiredCapacity}
                        setRequiredCapacity={setRequiredCapacity}
                        waterTableDepth={waterTableDepth}
                        setWaterTableDepth={setWaterTableDepth}
                        forceHeight={forceHeight}
                        setForceHeight={setForceHeight}
                        autoLength={autoLength}
                        setAutoLength={setAutoLength}
                        pileTopElevation={pileTopElevation}
                        setPileTopElevation={setPileTopElevation}
                      />
                    </TabsContent>
                    
                    <TabsContent value="safety" className="space-y-4">
                      <Card className="w-full">
                        <CardContent className="pt-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-5 w-5" />
                              <h3 className="text-lg font-medium">Safety Factors</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="soilSafetyFactor">Soil Parameters Safety Factor</Label>
                                <Input 
                                  id="soilSafetyFactor"
                                  type="number" 
                                  value={soilSafetyFactor}
                                  onChange={(e) => setSoilSafetyFactor(parseFloat(e.target.value))}
                                  min="1.0"
                                  step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Typical value: 1.5 - 2.0
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="structuralSafetyFactor">Structural Capacity</Label>
                                <Input 
                                  id="structuralSafetyFactor"
                                  type="number" 
                                  value={structuralSafetyFactor}
                                  onChange={(e) => setStructuralSafetyFactor(parseFloat(e.target.value))}
                                  min="1.0"
                                  step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Typical value: 1.5 - 2.0
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mt-2 p-4 bg-muted rounded-md">
                              <p className="mb-2 font-medium">Guidance on Safety Factors:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Higher safety factors should be used for critical structures or when soil conditions are uncertain</li>
                                <li>Lower safety factors may be acceptable for temporary structures or when soil conditions are well-known</li>
                                <li>Local building codes and regulations may specify minimum required safety factors</li>
                                <li>For preliminary design, the default values are typically adequate</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Analysis Settings</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Analysis Type</label>
                        <div className="p-3 border rounded-md bg-muted/50 flex items-center gap-2">
                          <MoveHorizontal className="h-5 w-5 text-primary" />
                          <span className="font-medium">Lateral Loading Analysis</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Calculations focused on lateral capacity using Broms' method
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-3">
                      {showResults && calculationResults && (
                        <Button 
                          variant="outline"
                          onClick={handleExportToExcel}
                          className="gap-2"
                        >
                          <FileDown className="h-5 w-5" />
                          Export to Excel
                        </Button>
                      )}
                      
                      <Button 
                        onClick={calculateResults}
                        size="lg"
                        className="gap-2"
                      >
                        <CalculatorIcon className="h-5 w-5" />
                        Calculate Pile Capacity
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <SoilProfileVisualization 
                    soilLayers={soilLayers}
                    pileProperties={pileProperties}
                    waterTableDepth={waterTableDepth}
                    forceHeight={forceHeight}
                    pileTopElevation={pileTopElevation}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          {showResults && calculationResults && (
            <div id="results-section" className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Calculation Results</h2>
                <Separator className="flex-1 mx-4" />
              </div>
              
              <CalculationResults 
                calculationResults={calculationResults}
                structuralCheck={structuralCheck}
                lateralResults={lateralResults}
                recommendedPiles={recommendedPiles}
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500">
            Lateral Pile Calculator | For preliminary design purposes only
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
