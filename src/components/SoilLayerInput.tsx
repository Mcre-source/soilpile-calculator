
import { useState } from 'react';
import { SOIL_TYPES, DEFAULT_SOIL_LAYER } from '../utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SoilLayerInputProps {
  soilLayers: any[];
  setSoilLayers: (layers: any[]) => void;
}

export default function SoilLayerInput({ soilLayers, setSoilLayers }: SoilLayerInputProps) {
  const handleAddLayer = () => {
    setSoilLayers([...soilLayers, { ...DEFAULT_SOIL_LAYER }]);
  };

  const handleRemoveLayer = (index: number) => {
    if (soilLayers.length > 1) {
      const newLayers = [...soilLayers];
      newLayers.splice(index, 1);
      setSoilLayers(newLayers);
    }
  };

  const handleLayerChange = (index: number, field: string, value: any) => {
    const newLayers = [...soilLayers];
    newLayers[index] = { ...newLayers[index], [field]: value };

    // If soil type changes, update properties
    if (field === 'type' && value !== 'custom') {
      const selectedSoil = SOIL_TYPES.find(soil => soil.id === value);
      if (selectedSoil) {
        newLayers[index].frictionAngle = selectedSoil.frictionAngle;
        newLayers[index].cohesion = selectedSoil.cohesion;
        newLayers[index].unitWeight = selectedSoil.unitWeight;
      }
    }

    setSoilLayers(newLayers);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Soil Profile</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddLayer}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Layer
            </Button>
          </div>
          
          <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground px-1">
            <div className="col-span-3">Soil Type</div>
            <div className="col-span-2">Thickness (m)</div>
            <div className="col-span-2">Friction Angle (°)</div>
            <div className="col-span-2">Cohesion (kPa)</div>
            <div className="col-span-2">Unit Weight (kN/m³)</div>
            <div className="col-span-1"></div>
          </div>
          
          {soilLayers.map((layer, index) => (
            <div key={index} className="soil-layer grid grid-cols-12 gap-2 items-center py-2">
              <div className="col-span-3">
                <Select
                  value={layer.type}
                  onValueChange={(value) => handleLayerChange(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((soil) => (
                      <SelectItem key={soil.id} value={soil.id}>
                        {soil.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={layer.thickness}
                  onChange={(e) => handleLayerChange(index, 'thickness', parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={layer.frictionAngle}
                  onChange={(e) => handleLayerChange(index, 'frictionAngle', parseFloat(e.target.value))}
                  min="0"
                  max="45"
                  disabled={layer.type !== 'custom' && SOIL_TYPES.find(soil => soil.id === layer.type)?.frictionAngle === 0}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={layer.cohesion}
                  onChange={(e) => handleLayerChange(index, 'cohesion', parseFloat(e.target.value))}
                  min="0"
                  disabled={layer.type !== 'custom' && SOIL_TYPES.find(soil => soil.id === layer.type)?.cohesion === 0}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  type="number"
                  value={layer.unitWeight}
                  onChange={(e) => handleLayerChange(index, 'unitWeight', parseFloat(e.target.value))}
                  min="10"
                  max="25"
                  step="0.1"
                />
              </div>
              
              <div className="col-span-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLayer(index)}
                  disabled={soilLayers.length <= 1}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
