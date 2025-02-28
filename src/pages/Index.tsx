
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
import { CalculatorIcon, ChevronDown, ChevronUp, Shield, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const { toast } = useToast();

  // State for soil profile
  const [soilLayers, setSoilLayers] = useState([
    { ...DEFAULT_SOIL_LAYER, thickness: 3 },
    { ...DEFAULT_SOIL_LAYER, type: 'sand-dense', thickness: 5, frictionAngle: 38, cohesion: 0, unitWeight: 20 },
    { ...DEFAULT_SOIL_LAYER, type: 'clay-medium', thickness: 10, frictionAngle: 0, cohesion: 50, unitWeight: 17 }
  ]);

  // State for pile properties
  const [pileProperties, setPileProperties] = useState({
    material: 'concrete',
    materialProperties: PILE_MATERIALS[0],
    diameter: 0.6,
    length: 15
  });

  // State for pile auto-length calculation
  const [autoLength, setAutoLength] = useState(false);

  // State for calculation inputs
  const [requiredCapacity, setRequiredCapacity] = useState(1000);
  const [waterTableDepth, setWaterTableDepth] = useState(5);
  const [forceHeight, setForceHeight] = useState(0);
  const [calculationMethod, setCalculationMethod] = useState('beta');
  
  // State for safety factors
  const [bearingSafetyFactor, setBearingSafetyFactor] = useState(SAFETY_FACTORS.bearing);
  const [structuralSafetyFactor, setStructuralSafetyFactor] = useState(SAFETY_FACTORS.structural);
  const [lateralSafetyFactor, setLateralSafetyFactor] = useState(SAFETY_FACTORS.sliding);

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
      // This is a simplified version - we'll use the recommendation engine instead of a complex calculation here
      const recommendations = recommendPileDimensions(
        requiredCapacity,
        soilLayers,
        waterTableDepth,
        pileProperties.materialProperties,
        bearingSafetyFactor,
        structuralSafetyFactor
      );
      
      if (recommendations.length > 0) {
        // Find a recommendation with the same diameter or close to it
        const matchingRecommendation = recommendations.find(r => 
          Math.abs(r.diameter - pileProperties.diameter) < 0.1
        );
        
        if (matchingRecommendation) {
          // Limit the maximum length to 20m as requested
          const recommendedLength = Math.min(20, matchingRecommendation.length);
          setPileProperties(prev => ({ ...prev, length: recommendedLength }));
        }
      }
    }
  }, [autoLength, pileProperties.diameter, pileProperties.material, requiredCapacity, soilLayers, waterTableDepth]);

  // Calculate results
  const calculateResults = () => {
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
    if (bearingSafetyFactor < 1 || structuralSafetyFactor < 1 || lateralSafetyFactor < 1) {
      toast({
        title: "Error",
        description: "Safety factors must be greater than or equal to 1.0",
        variant: "destructive"
      });
      return;
    }

    // Perform calculations
    let results;
    if (calculationMethod === 'alpha') {
      results = calculateAlphaMethod(soilLayers, pileProperties, waterTableDepth);
    } else {
      results = calculateBetaMethod(soilLayers, pileProperties, waterTableDepth);
    }

    // Override the default safety factor with user input
    results.allowableCapacity = results.totalCapacity / bearingSafetyFactor;

    // Add input values to results for reference
    results.pileProperties = pileProperties;
    results.requiredCapacity = requiredCapacity;
    results.waterTableDepth = waterTableDepth;
    results.forceHeight = forceHeight;
    results.appliedSafetyFactor = bearingSafetyFactor;
    results.appliedStructuralSafetyFactor = structuralSafetyFactor;
    results.appliedLateralSafetyFactor = lateralSafetyFactor;

    // Calculate structural capacity check
    const structuralResults = checkStructuralCapacity(
      pileProperties,
      pileProperties.materialProperties,
      requiredCapacity * bearingSafetyFactor,
      structuralSafetyFactor
    );

    // Calculate lateral capacity
    const lateralCapacityResults = calculateLateralCapacity(
      soilLayers,
      pileProperties,
      waterTableDepth,
      forceHeight,
      lateralSafetyFactor
    );

    // Generate recommendations
    const recommendations = recommendPileDimensions(
      requiredCapacity,
      soilLayers,
      waterTableDepth,
      pileProperties.materialProperties,
      bearingSafetyFactor,
      structuralSafetyFactor
    );

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
              <h1 className="text-2xl font-semibold text-gray-900">Soil Pile Calculator</h1>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="bearingSafetyFactor">Bearing Capacity</Label>
                                <Input 
                                  id="bearingSafetyFactor"
                                  type="number" 
                                  value={bearingSafetyFactor}
                                  onChange={(e) => setBearingSafetyFactor(parseFloat(e.target.value))}
                                  min="1.0"
                                  step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Typical value: 2.0 - 3.0
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
                              
                              <div className="space-y-2">
                                <Label htmlFor="lateralSafetyFactor">Lateral Capacity</Label>
                                <Input 
                                  id="lateralSafetyFactor"
                                  type="number" 
                                  value={lateralSafetyFactor}
                                  onChange={(e) => setLateralSafetyFactor(parseFloat(e.target.value))}
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
                        <label className="text-sm font-medium">Calculation Method</label>
                        <Select
                          value={calculationMethod}
                          onValueChange={setCalculationMethod}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select calculation method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alpha">Alpha Method (Total Stress)</SelectItem>
                            <SelectItem value="beta">Beta Method (Effective Stress)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {calculationMethod === 'alpha' 
                            ? 'Recommended for cohesive soils (clays)' 
                            : 'Recommended for granular soils (sands)'}
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
            Soil Pile Calculator | For preliminary design purposes only
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
