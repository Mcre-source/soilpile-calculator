import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface AssumptionsTabProps {
  calculationResults: any;
  safetyFactors: {
    bearing: number;
    structural: number;
    sliding: number;
  };
}
export default function AssumptionsTab({
  calculationResults,
  safetyFactors
}: AssumptionsTabProps) {
  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Calculation Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">General Assumptions</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Pile is assumed to be vertical with no installation deviation</li>
                <li>Ground is level with no slope effects</li>
                <li>No group effects are considered (single pile analysis)</li>
                <li>Static loading conditions are assumed</li>
                <li>Soil properties are assumed to be homogeneous within each layer</li>
                <li>Water table is assumed to be horizontal</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Method-Specific Assumptions</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {calculationResults.assumptions.map((assumption: string, index: number) => <li key={index}>{assumption}</li>)}
              </ul>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Safety Factors</h3>
              <div className="space-y-2">
                
                <div className="flex justify-between">
                  <span>Structural Capacity:</span>
                  <span className="font-medium">{calculationResults.appliedStructuralSafetyFactor || safetyFactors.structural}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lateral Capacity:</span>
                  <span className="font-medium">{calculationResults.appliedLateralSafetyFactor || safetyFactors.sliding}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Limitations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>This calculator provides preliminary design guidance only and is not a substitute for professional engineering judgment</li>
                <li>Detailed geotechnical investigation is recommended for final design</li>
                <li>Simplified calculation methods are used and may not capture all site-specific conditions</li>
                <li>Local building codes and standards should be consulted for specific safety factor requirements</li>
                <li>Results should be verified with more detailed analysis for critical projects</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}