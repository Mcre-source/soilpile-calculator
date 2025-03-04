
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RectangleVertical } from 'lucide-react';

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
  pileProperties?: { 
    length: number;
    diameter: number;
  };
}

const formatData = (data: DeflectionDataPoint[], pileLength?: number) => {
  if (!data || !Array.isArray(data)) return [];
  
  // Process the data to format it for the charts
  // If pile length is provided, filter data to only include points within the pile length
  const formattedData = data.map(point => ({
    depth: Number(point.depth.toFixed(2)),
    value: Number(point.value.toFixed(4))
  }));

  if (pileLength) {
    return formattedData.filter(point => point.depth <= pileLength);
  }
  
  return formattedData;
};

const DeflectionCharts: React.FC<DeflectionChartsProps> = ({ deflectionData, pileProperties }) => {
  if (!deflectionData) return null;

  // Get the pile length, default to max depth if not provided
  const pileLength = pileProperties?.length || 0;
  
  // Filter data to only include points within the pile length
  const deflectionPoints = formatData(deflectionData.deflection, pileLength);
  const momentPoints = formatData(deflectionData.bendingMoment, pileLength);
  const shearPoints = formatData(deflectionData.shearForce, pileLength);

  // Get max absolute values for scaling
  const maxDeflection = deflectionData.maxDeflection;
  const maxMoment = deflectionData.maxBendingMoment;
  const maxShear = deflectionData.maxShearForce;

  // Set the Y-axis domain to show from ground level (0) to the pile length
  const minDepth = 0;
  const maxDepth = pileLength > 0 ? pileLength : Math.max(...deflectionPoints.map(p => p.depth));

  // Custom Pile Icon component to show in the legend
  const PileIcon = () => (
    <div className="flex items-center">
      <RectangleVertical className="w-4 h-4 mr-1" />
      <span>Pile Length ({pileLength}m)</span>
    </div>
  );

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
                  <Legend content={() => <PileIcon />} />
                  <ReferenceLine
                    y={pileLength}
                    stroke="#333"
                    strokeDasharray="3 3"
                    label={{ value: 'Pile Tip', position: 'insideBottomRight' }}
                  />
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
                  <Legend content={() => <PileIcon />} />
                  <ReferenceLine
                    y={pileLength}
                    stroke="#333"
                    strokeDasharray="3 3"
                    label={{ value: 'Pile Tip', position: 'insideBottomRight' }}
                  />
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
                  <Legend content={() => <PileIcon />} />
                  <ReferenceLine
                    y={pileLength}
                    stroke="#333"
                    strokeDasharray="3 3"
                    label={{ value: 'Pile Tip', position: 'insideBottomRight' }}
                  />
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
