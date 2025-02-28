
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DeflectionChartsProps {
  deflectionResults: {
    deflection: any[];
    bendingMoment: any[];
    shearForce: any[];
    maxDeflection: number;
    maxBendingMoment: number;
    maxShearForce: number;
  };
  pileProperties: any;
}

const DeflectionCharts = ({ deflectionResults, pileProperties }: DeflectionChartsProps) => {
  if (!deflectionResults) return <div>No deflection data available</div>;

  // Format data for charts - we need to invert the y-axis for depths
  // Positive deflection is to the right, negative to the left
  const deflectionData = deflectionResults.deflection.map(point => ({
    depth: point.depth,
    deflection: point.value
  }));

  // Bending moment - positive is tension on the side facing the load
  const momentData = deflectionResults.bendingMoment.map(point => ({
    depth: point.depth,
    moment: point.value
  }));

  // Shear force - positive is upward
  const shearData = deflectionResults.shearForce.map(point => ({
    depth: point.depth,
    shear: point.value
  }));

  // Determine axis domains with some padding
  const maxDeflection = Math.max(Math.abs(deflectionResults.maxDeflection) * 1.2, 0.001);
  const maxMoment = Math.max(Math.abs(deflectionResults.maxBendingMoment) * 1.2, 1);
  const maxShear = Math.max(Math.abs(deflectionResults.maxShearForce) * 1.2, 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Pile Structural Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>The charts below show the calculated pile response to lateral loading. These calculations use a simplified beam-on-elastic-foundation analysis with soil modeled using p-y curves derived from soil properties.</p>
          </div>

          <Tabs defaultValue="deflection" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="deflection">Lateral Deflection</TabsTrigger>
              <TabsTrigger value="moment">Bending Moment</TabsTrigger>
              <TabsTrigger value="shear">Shear Force</TabsTrigger>
            </TabsList>

            <TabsContent value="deflection">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Lateral Deflection</h3>
                  <span className="text-sm">Max: {deflectionResults.maxDeflection.toFixed(3)} m</span>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={deflectionData}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="deflection" 
                        type="number"
                        domain={[-maxDeflection, maxDeflection]}
                        label={{ value: 'Deflection (m)', position: 'bottom', offset: 0 }}
                      />
                      <YAxis 
                        dataKey="depth" 
                        reversed={true}
                        domain={[0, 'auto']}
                        label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${Number(value).toFixed(4)} m`, 'Deflection']}
                        labelFormatter={(label) => `Depth: ${Number(label).toFixed(2)} m`}
                      />
                      <ReferenceLine x={0} stroke="#888" />
                      <Line 
                        type="monotone" 
                        dataKey="deflection" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Positive values indicate deflection in the direction of the applied load. The maximum allowable deflection for typical structures is often limited to 1% of the pile diameter.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="moment">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Bending Moment Diagram</h3>
                  <span className="text-sm">Max: {deflectionResults.maxBendingMoment.toFixed(1)} kN·m</span>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={momentData}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="moment" 
                        type="number"
                        domain={[-maxMoment, maxMoment]}
                        label={{ value: 'Bending Moment (kN·m)', position: 'bottom', offset: 0 }}
                      />
                      <YAxis 
                        dataKey="depth" 
                        reversed={true}
                        domain={[0, 'auto']}
                        label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${Number(value).toFixed(2)} kN·m`, 'Bending Moment']}
                        labelFormatter={(label) => `Depth: ${Number(label).toFixed(2)} m`}
                      />
                      <ReferenceLine x={0} stroke="#888" />
                      <Line 
                        type="monotone" 
                        dataKey="moment" 
                        stroke="#82ca9d" 
                        activeDot={{ r: 8 }} 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Positive values indicate tension on the loaded face of the pile. The maximum bending moment determines the required structural capacity of the pile section.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shear">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Shear Force Diagram</h3>
                  <span className="text-sm">Max: {deflectionResults.maxShearForce.toFixed(1)} kN</span>
                </div>

                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={shearData}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="shear" 
                        type="number"
                        domain={[-maxShear, maxShear]}
                        label={{ value: 'Shear Force (kN)', position: 'bottom', offset: 0 }}
                      />
                      <YAxis 
                        dataKey="depth" 
                        reversed={true}
                        domain={[0, 'auto']}
                        label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${Number(value).toFixed(2)} kN`, 'Shear Force']}
                        labelFormatter={(label) => `Depth: ${Number(label).toFixed(2)} m`}
                      />
                      <ReferenceLine x={0} stroke="#888" />
                      <Line 
                        type="monotone" 
                        dataKey="shear" 
                        stroke="#ff7300" 
                        activeDot={{ r: 8 }} 
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>The shear force diagram represents the internal shear in the pile. The derivative of the bending moment diagram gives the shear force distribution.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-md text-sm">
            <h3 className="font-medium mb-2">Key Observations:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Maximum deflection occurs at or near the ground surface</li>
              <li>Maximum bending moment typically occurs below the ground surface</li>
              <li>Pile exhibits fixed-head behavior with rotation constrained at the top</li>
              <li>No axial load is applied in this analysis</li>
              <li>Actual behavior may differ based on installation conditions and soil variability</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeflectionCharts;
