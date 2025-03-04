
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatChartData, DeflectionDataPoint } from '@/utils/chartDataUtils';
import DeflectionTab from './charts/DeflectionTab';
import BendingMomentTab from './charts/BendingMomentTab';
import ShearForceTab from './charts/ShearForceTab';

interface DeflectionData {
  deflection: DeflectionDataPoint[];
  bendingMoment: DeflectionDataPoint[];
  shearForce: DeflectionDataPoint[];
  maxDeflection: number;
  maxBendingMoment: number;
  maxShearForce: number;
  characteristicLength: number;
  pileStiffness: number;
  averageSoilModulus: number;
}

interface DeflectionChartsProps {
  deflectionData: DeflectionData;
  pileProperties?: { 
    length: number;
    diameter: number;
  };
}

const DeflectionCharts: React.FC<DeflectionChartsProps> = ({ deflectionData, pileProperties }) => {
  if (!deflectionData) return null;

  // Get the pile length, default to max depth if not provided
  const pileLength = pileProperties?.length || 0;
  
  // Filter data to only include points within the pile length
  const deflectionPoints = formatChartData(deflectionData.deflection, pileLength);
  const momentPoints = formatChartData(deflectionData.bendingMoment, pileLength);
  const shearPoints = formatChartData(deflectionData.shearForce, pileLength);

  // Get max absolute values for scaling
  const maxDeflection = deflectionData.maxDeflection;
  const maxMoment = deflectionData.maxBendingMoment;
  const maxShear = deflectionData.maxShearForce;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pile Response Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deflection" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="deflection">Deflection</TabsTrigger>
            <TabsTrigger value="moment">Bending Moment</TabsTrigger>
            <TabsTrigger value="shear">Shear Force</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deflection">
            <DeflectionTab 
              deflectionPoints={deflectionPoints} 
              maxDeflection={maxDeflection} 
              pileLength={pileLength} 
            />
          </TabsContent>
          
          <TabsContent value="moment">
            <BendingMomentTab 
              momentPoints={momentPoints} 
              maxMoment={maxMoment} 
              pileLength={pileLength} 
            />
          </TabsContent>
          
          <TabsContent value="shear">
            <ShearForceTab 
              shearPoints={shearPoints} 
              maxShear={maxShear} 
              pileLength={pileLength} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeflectionCharts;
