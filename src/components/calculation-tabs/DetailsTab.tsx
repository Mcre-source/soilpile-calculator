
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeflectionCharts from '../DeflectionCharts';
import { formatNumber } from '@/utils/formatters';

interface DetailsTabProps {
  calculationResults: any;
  structuralCheck: any;
  deflectionData: any;
}

export default function DetailsTab({ 
  calculationResults, 
  structuralCheck,
  deflectionData
}: DetailsTabProps) {
  return (
    <div className="space-y-4">
      {deflectionData && (
        <DeflectionCharts deflectionData={deflectionData} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Structural Capacity Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">{structuralCheck.notes}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Stress Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Applied Axial Load:</span>
                    <span className="font-medium">{formatNumber(calculationResults.requiredCapacity * calculationResults.appliedSafetyFactor, 'kN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-sectional Area:</span>
                    <span className="font-medium">{formatNumber(structuralCheck.crossSectionalArea, 'm²')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compressive Stress:</span>
                    <span className="font-medium">{formatNumber(structuralCheck.compressiveStress, 'MPa')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowable Stress:</span>
                    <span className="font-medium">{formatNumber(structuralCheck.allowableStress, 'MPa')}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Material Properties</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span className="font-medium capitalize">{calculationResults.pileProperties.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield Strength:</span>
                    <span className="font-medium">{formatNumber(calculationResults.pileProperties.materialProperties.yield_strength, 'MPa')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elastic Modulus:</span>
                    <span className="font-medium">{formatNumber(calculationResults.pileProperties.materialProperties.elasticity, 'MPa')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Factor:</span>
                    <span className="font-medium">{calculationResults.appliedSafetyFactor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
