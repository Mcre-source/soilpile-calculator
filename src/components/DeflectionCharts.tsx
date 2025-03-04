
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DeflectionDataPoint {
  depth: number;
  value: number;
}

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
}

const formatData = (data: DeflectionDataPoint[]) => {
  if (!data || !Array.isArray(data)) return [];
  
  // Process the data to format it for the charts
  return data.map(point => ({
    depth: Number(point.depth.toFixed(2)),
    value: Number(point.value.toFixed(4))
  }));
};

const DeflectionCharts: React.FC<DeflectionChartsProps> = ({ deflectionData }) => {
  if (!deflectionData) return null;

  const deflectionPoints = formatData(deflectionData.deflection);
  const momentPoints = formatData(deflectionData.bendingMoment);
  const shearPoints = formatData(deflectionData.shearForce);

  // Get max absolute values for scaling
  const maxDeflection = deflectionData.maxDeflection;
  const maxMoment = deflectionData.maxBendingMoment;
  const maxShear = deflectionData.maxShearForce;

  // Calculate the min and max depths for Y-axis domain
  const minDepth = Math.min(...deflectionPoints.map(p => p.depth));
  const maxDepth = Math.max(...deflectionPoints.map(p => p.depth));

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
            <div className="h-80 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={deflectionPoints}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="value"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    label={{ value: 'Deflection (m)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    reversed
                    domain={[minDepth, maxDepth]}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(6)} m`, 'Deflection']}
                    labelFormatter={(label: any) => `Depth: ${label} m`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Deflection" 
                    stroke="#8884d8" 
                    dot={false} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm mt-2">
              <p>Maximum Deflection: {maxDeflection.toExponential(4)} m</p>
              <p className="text-xs text-gray-500 mt-1">
                This graph shows the lateral deflection of the pile as a function of depth.
                Positive values indicate deflection in the direction of the applied load.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="moment">
            <div className="h-80 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={momentPoints}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="value"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    label={{ value: 'Bending Moment (kN·m)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    reversed
                    domain={[minDepth, maxDepth]}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kN·m`, 'Bending Moment']}
                    labelFormatter={(label: any) => `Depth: ${label} m`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Moment" 
                    stroke="#82ca9d" 
                    dot={false} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm mt-2">
              <p>Maximum Bending Moment: {maxMoment.toFixed(2)} kN·m</p>
              <p className="text-xs text-gray-500 mt-1">
                This graph shows the bending moment in the pile as a function of depth.
                Positive values indicate tension on the side facing the applied load.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="shear">
            <div className="h-80 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={shearPoints}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="value"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    label={{ value: 'Shear Force (kN)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    reversed
                    domain={[minDepth, maxDepth]}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} kN`, 'Shear Force']}
                    labelFormatter={(label: any) => `Depth: ${label} m`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Shear" 
                    stroke="#ff7300" 
                    dot={false} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm mt-2">
              <p>Maximum Shear Force: {maxShear.toFixed(2)} kN</p>
              <p className="text-xs text-gray-500 mt-1">
                This graph shows the shear force in the pile as a function of depth.
                Positive values indicate shear in the direction of the applied load.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeflectionCharts;
