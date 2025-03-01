
import { useState, useEffect } from 'react';
import { PILE_MATERIALS, STANDARD_PILE_DIAMETERS, COMPOSITE_MATERIALS, COMPOSITE_CORE_MATERIALS } from '../utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CircleOff, 
  CircleDot, 
  Ruler, 
  Waves, 
  Weight,
  Calculator,
  MoveHorizontal,
  ChevronUp
} from 'lucide-react';

interface PileInputProps {
  pileProperties: any;
  setPileProperties: (properties: any) => void;
  requiredCapacity: number;
  setRequiredCapacity: (capacity: number) => void;
  waterTableDepth: number;
  setWaterTableDepth: (depth: number) => void;
  forceHeight: number;
  setForceHeight: (height: number) => void;
  autoLength: boolean;
  setAutoLength: (auto: boolean) => void;
  pileTopElevation: number;
  setPileTopElevation: (elevation: number) => void;
}

export default function PileInput({ 
  pileProperties, 
  setPileProperties,
  requiredCapacity,
  setRequiredCapacity,
  waterTableDepth,
  setWaterTableDepth,
  forceHeight,
  setForceHeight,
  autoLength,
  setAutoLength,
  pileTopElevation,
  setPileTopElevation
}: PileInputProps) {
  const [customDiameter, setCustomDiameter] = useState(false);

  const handlePileChange = (field: string, value: any) => {
    setPileProperties({ ...pileProperties, [field]: value });
  };

  const handleMaterialChange = (materialId: string) => {
    const material = PILE_MATERIALS.find(m => m.id === materialId);
    if (material) {
      const newPileProps = { 
        ...pileProperties, 
        material: materialId,
        materialProperties: material 
      };

      // Add wall thickness for steel piles
      if (material.id === 'steel' && !pileProperties.wallThickness) {
        newPileProps.wallThickness = material.default_wall_thickness;
      }

      // Add composite material properties
      if (material.id === 'composite' && !pileProperties.compositeMaterials) {
        newPileProps.compositeMaterials = {
          material1: material.composite_material_1,
          material2: material.composite_material_2,
          ratio: material.composite_ratio
        };
      }

      setPileProperties(newPileProps);
    }
  };

  // Ensure force height doesn't exceed pile top elevation
  useEffect(() => {
    if (forceHeight > pileTopElevation) {
      setForceHeight(pileTopElevation);
    }
  }, [forceHeight, pileTopElevation, setForceHeight]);

  // Initial material setup
  useEffect(() => {
    if (!pileProperties.materialProperties && pileProperties.material) {
      handleMaterialChange(pileProperties.material);
    }
  }, []);

  // Get the selected composite material details
  const getCompositeMaterialDetails = (materialId: string) => {
    return COMPOSITE_MATERIALS.find(m => m.id === materialId) ||
           COMPOSITE_CORE_MATERIALS.find(m => m.id === materialId);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Pile Properties & Loading</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="material" className="flex items-center gap-2">
                  <Weight className="h-4 w-4" /> Material
                </Label>
                <Select
                  value={pileProperties.material}
                  onValueChange={handleMaterialChange}
                >
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Select pile material" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILE_MATERIALS.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pileProperties.material === 'steel' && (
                <div className="space-y-2">
                  <Label htmlFor="wallThickness" className="flex items-center gap-2">
                    <CircleOff className="h-4 w-4" /> Wall Thickness (m)
                  </Label>
                  <Input
                    id="wallThickness"
                    type="number"
                    value={pileProperties.wallThickness || 0.02}
                    onChange={(e) => handlePileChange('wallThickness', parseFloat(e.target.value))}
                    min="0.005"
                    max="0.1"
                    step="0.001"
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical range: 5mm - 100mm depending on diameter and loads
                  </p>
                </div>
              )}

              {pileProperties.material === 'composite' && (
                <div className="space-y-3">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="composite-materials">
                      <AccordionTrigger className="text-sm">
                        Composite Material Properties
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="compositeMaterial1">Outer Material</Label>
                            <Select
                              value={pileProperties.compositeMaterials?.material1 || PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_1}
                              onValueChange={(value) => {
                                handlePileChange('compositeMaterials', {
                                  ...pileProperties.compositeMaterials || {
                                    material1: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_1,
                                    material2: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_2,
                                    ratio: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_ratio || 0.3
                                  },
                                  material1: value
                                });
                              }}
                            >
                              <SelectTrigger id="compositeMaterial1">
                                <SelectValue placeholder="Select outer material" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMPOSITE_MATERIALS.map((material) => (
                                  <SelectItem key={material.id} value={material.id}>
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="compositeMaterial2">Core Material</Label>
                            <Select
                              value={pileProperties.compositeMaterials?.material2 || PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_2}
                              onValueChange={(value) => {
                                handlePileChange('compositeMaterials', {
                                  ...pileProperties.compositeMaterials || {
                                    material1: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_1,
                                    material2: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_2,
                                    ratio: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_ratio || 0.3
                                  },
                                  material2: value
                                });
                              }}
                            >
                              <SelectTrigger id="compositeMaterial2">
                                <SelectValue placeholder="Select core material" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMPOSITE_CORE_MATERIALS.map((material) => (
                                  <SelectItem key={material.id} value={material.id}>
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="compositeRatio">
                              Fiber Reinforcement Ratio: {((pileProperties.compositeMaterials?.ratio || 0.3) * 100).toFixed(0)}%
                            </Label>
                            <Slider
                              id="compositeRatio"
                              min={0.1}
                              max={0.6}
                              step={0.05}
                              value={[pileProperties.compositeMaterials?.ratio || 0.3]}
                              onValueChange={(value) => {
                                handlePileChange('compositeMaterials', {
                                  ...pileProperties.compositeMaterials || {
                                    material1: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_1,
                                    material2: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_2,
                                    ratio: PILE_MATERIALS.find(m => m.id === 'composite')?.composite_ratio || 0.3
                                  },
                                  ratio: value[0]
                                });
                              }}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>10%</span>
                              <span>60%</span>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Outer Material: </span>
                              <span>
                                {getCompositeMaterialDetails(pileProperties.compositeMaterials?.material1 || PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_1 || '')?.yield_strength || '–'} MPa
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Core Material: </span>
                              <span>
                                {getCompositeMaterialDetails(pileProperties.compositeMaterials?.material2 || PILE_MATERIALS.find(m => m.id === 'composite')?.composite_material_2 || '')?.yield_strength || '–'} MPa
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="diameter" className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4" /> Diameter (m)
                  </Label>
                  <div className="flex items-center">
                    <Label htmlFor="customDiameter" className="text-xs text-muted-foreground mr-2">
                      Custom
                    </Label>
                    <input
                      type="checkbox"
                      id="customDiameter"
                      checked={customDiameter}
                      onChange={(e) => setCustomDiameter(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                
                {customDiameter ? (
                  <Input
                    id="diameter"
                    type="number"
                    value={pileProperties.diameter}
                    onChange={(e) => handlePileChange('diameter', parseFloat(e.target.value))}
                    min="0.2"
                    max="3.0"
                    step="0.1"
                  />
                ) : (
                  <Select
                    value={pileProperties.diameter.toString()}
                    onValueChange={(value) => handlePileChange('diameter', parseFloat(value))}
                  >
                    <SelectTrigger id="diameter">
                      <SelectValue placeholder="Select diameter" />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARD_PILE_DIAMETERS.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d.toFixed(1)} m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="length" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" /> Length (m)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="autoLength" className="text-xs text-muted-foreground">
                      Auto Calculate
                    </Label>
                    <Switch
                      id="autoLength"
                      checked={autoLength}
                      onCheckedChange={setAutoLength}
                    />
                  </div>
                </div>
                
                {autoLength ? (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Pile length will be automatically calculated (max 20m)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Slider
                      id="length"
                      min={3}
                      max={50}
                      step={0.5}
                      value={[pileProperties.length]}
                      onValueChange={(value) => handlePileChange('length', value[0])}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">3m</span>
                      <span className="text-sm font-medium">{pileProperties.length.toFixed(1)}m</span>
                      <span className="text-sm text-muted-foreground">50m</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pileTopElevation" className="flex items-center gap-2">
                  <ChevronUp className="h-4 w-4" /> Pile Top Elevation (m)
                </Label>
                <div className="space-y-3">
                  <Slider
                    id="pileTopElevation"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[pileTopElevation]}
                    onValueChange={(value) => setPileTopElevation(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ground level</span>
                    <span className="text-sm font-medium">{pileTopElevation.toFixed(1)}m above ground</span>
                    <span className="text-sm text-muted-foreground">10m</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requiredCapacity" className="flex items-center gap-2">
                  <MoveHorizontal className="h-4 w-4" /> Required Lateral Capacity (kN)
                </Label>
                <Input
                  id="requiredCapacity"
                  type="number"
                  value={requiredCapacity}
                  onChange={(e) => setRequiredCapacity(parseFloat(e.target.value))}
                  min="10"
                  step="10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="waterTableDepth" className="flex items-center gap-2">
                  <Waves className="h-4 w-4" /> Water Level (m)
                </Label>
                <div className="space-y-3">
                  <Slider
                    id="waterTableDepth"
                    min={-5}
                    max={30}
                    step={0.5}
                    value={[waterTableDepth]}
                    onValueChange={(value) => setWaterTableDepth(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">5m above ground</span>
                    <span className="text-sm font-medium">
                      {waterTableDepth < 0 
                        ? `${Math.abs(waterTableDepth).toFixed(1)}m above ground` 
                        : waterTableDepth === 0 
                          ? 'At ground level' 
                          : `${waterTableDepth.toFixed(1)}m below ground`}
                    </span>
                    <span className="text-sm text-muted-foreground">30m below</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="forceHeight" className="flex items-center gap-2">
                  <CircleOff className="h-4 w-4" /> Force Application Height (m)
                </Label>
                <div className="space-y-3">
                  <Slider
                    id="forceHeight"
                    min={0}
                    max={Math.max(pileTopElevation, 0.1)}
                    step={0.1}
                    value={[Math.min(forceHeight, pileTopElevation)]}
                    onValueChange={(value) => setForceHeight(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ground level</span>
                    <span className="text-sm font-medium">{forceHeight.toFixed(1)}m</span>
                    <span className="text-sm text-muted-foreground">{pileTopElevation.toFixed(1)}m</span>
                  </div>
                  {forceHeight > pileTopElevation && (
                    <p className="text-xs text-destructive">
                      Force height cannot exceed pile top elevation
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-md mt-2">
                <h4 className="text-sm font-medium mb-2">Calculation Approach</h4>
                <p className="text-xs text-muted-foreground">
                  Lateral capacity is calculated using Broms' method, which considers soil type and pile behavior. 
                  Short rigid piles and long flexible piles are analyzed differently. The calculation accounts for 
                  pile embedment, soil strength parameters, and lateral deflection. No axial loading is considered in this analysis.
                </p>
              </div>
            </div>
          </div>
          
          {pileProperties.materialProperties && (
            <div className="mt-2">
              <Separator className="my-2" />
              <div className="text-sm text-muted-foreground mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-medium">Yield Strength:</span> {pileProperties.materialProperties.yield_strength} MPa
                  </div>
                  <div>
                    <span className="font-medium">Elastic Modulus:</span> {pileProperties.materialProperties.elasticity} MPa
                  </div>
                  <div>
                    <span className="font-medium">Unit Weight:</span> {pileProperties.materialProperties.unit_weight} kN/m³
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
