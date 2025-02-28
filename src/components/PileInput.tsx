
import { useState, useEffect } from 'react';
import { PILE_MATERIALS, STANDARD_PILE_DIAMETERS } from '../utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CircleOff, 
  CircleDot, 
  Ruler, 
  Waves, 
  ArrowDownUp, 
  Weight
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
}

export default function PileInput({ 
  pileProperties, 
  setPileProperties,
  requiredCapacity,
  setRequiredCapacity,
  waterTableDepth,
  setWaterTableDepth,
  forceHeight,
  setForceHeight
}: PileInputProps) {
  const [customDiameter, setCustomDiameter] = useState(false);

  const handlePileChange = (field: string, value: any) => {
    setPileProperties({ ...pileProperties, [field]: value });
  };

  const handleMaterialChange = (materialId: string) => {
    const material = PILE_MATERIALS.find(m => m.id === materialId);
    if (material) {
      setPileProperties({ 
        ...pileProperties, 
        material: materialId,
        materialProperties: material 
      });
    }
  };

  useEffect(() => {
    // Initial material setup
    if (!pileProperties.materialProperties && pileProperties.material) {
      handleMaterialChange(pileProperties.material);
    }
  }, []);

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
                <Label htmlFor="length" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" /> Length (m)
                </Label>
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
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requiredCapacity" className="flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4" /> Required Axial Capacity (kN)
                </Label>
                <Input
                  id="requiredCapacity"
                  type="number"
                  value={requiredCapacity}
                  onChange={(e) => setRequiredCapacity(parseFloat(e.target.value))}
                  min="100"
                  step="50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="waterTableDepth" className="flex items-center gap-2">
                  <Waves className="h-4 w-4" /> Water Table Depth (m)
                </Label>
                <div className="space-y-3">
                  <Slider
                    id="waterTableDepth"
                    min={0}
                    max={30}
                    step={0.5}
                    value={[waterTableDepth]}
                    onValueChange={(value) => setWaterTableDepth(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Surface</span>
                    <span className="text-sm font-medium">{waterTableDepth.toFixed(1)}m</span>
                    <span className="text-sm text-muted-foreground">30m</span>
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
                    max={10}
                    step={0.1}
                    value={[forceHeight]}
                    onValueChange={(value) => setForceHeight(value[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ground level</span>
                    <span className="text-sm font-medium">{forceHeight.toFixed(1)}m</span>
                    <span className="text-sm text-muted-foreground">10m</span>
                  </div>
                </div>
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
