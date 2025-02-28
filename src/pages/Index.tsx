
import { useState, useEffect } from 'react';
import { SOIL_TYPES, DEFAULT_SOIL_LAYER, PILE_MATERIALS, STANDARD_PILE_DIAMETERS, SAFETY_FACTORS } from '../utils/constants';
import { calculateAlphaMethod, calculateBetaMethod, checkStructuralCapacity, recommendPileDimensions, calculateLateralCapacity } from '../utils/calculations';
import SoilLayerInput from '../components/SoilLayerInput';
import PileInput from '../components/PileInput';
import CalculationResults from '../components/CalculationResults';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CalculatorIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // State for calculation inputs
  const [requiredCapacity, setRequiredCapacity] = useState(1000);
  const [waterTableDepth, setWaterTableDepth] = useState(5);
  const [forceHeight, setForceHeight] = useState(0);
  const [calculationMethod, setCalculationMethod] = useState('beta');

  // State for calculation results
  const [calculationResults, setCalculationResults] = useState(null);
  const [structuralCheck, setStructuralCheck] = useState(null);
  const [lateralResults, setLateralResults] = useState(null);
  const [recommendedPiles, setRecommendedPiles] = useState([]);
  const [showResults, setShowResults] = useState(false);

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

    // Perform calculations
    let results;
    if (calculationMethod === 'alpha') {
      results = calculateAlphaMethod(soilLayers, pileProperties, waterTableDepth);
    } else {
      results = calculateBetaMethod(soilLayers, pileProperties, waterTableDepth);
    }

    // Add input values to results for reference
    results.pileProperties = pileProperties;
    results.requiredCapacity = requiredCapacity;
    results.waterTableDepth = waterTableDepth;
    results.forceHeight = forceHeight;
    results.appliedSafetyFactor = SAFETY_FACTORS.bearing;

    // Calculate structural capacity check
    const structuralResults = checkStructuralCapacity(
      pileProperties,
      pileProperties.materialProperties,
      requiredCapacity * SAFETY_FACTORS.bearing
    );

    // Calculate lateral capacity
    const lateralCapacityResults = calculateLateralCapacity(
      soilLayers,
      pileProperties,
      waterTableDepth,
      forceHeight
    );

    // Generate recommendations
    const recommendations = recommendPileDimensions(
      requiredCapacity,
      soilLayers,
      waterTableDepth,
      pileProperties.materialProperties
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
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
              <Tabs defaultValue="soil" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="soil">Soil Profile</TabsTrigger>
                  <TabsTrigger value="pile">Pile Properties</TabsTrigger>
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
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
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
                
                <div className="flex justify-end mt-4">
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
