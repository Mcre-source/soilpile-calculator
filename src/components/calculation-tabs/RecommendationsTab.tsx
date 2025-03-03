
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface RecommendationsTabProps {
  recommendedPiles: any[];
}

export default function RecommendationsTab({ 
  recommendedPiles 
}: RecommendationsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Pile Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendedPiles.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm">
                Based on your soil profile and required capacity, these pile configurations are recommended:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedPiles.map((pile, index) => (
                  <div key={index} className={`p-4 border rounded-md ${index === 0 ? 'border-primary' : 'border-muted'}`}>
                    {index === 0 && (
                      <Badge className="mb-2">Recommended</Badge>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="h-4 w-4" />
                      <h3 className="font-semibold">Option {index + 1}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Diameter:</span>
                        <span className="font-medium">{pile.diameter.toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Length:</span>
                        <span className="font-medium">{pile.length.toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium">{formatNumber(pile.allowableCapacity, 'kN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilization:</span>
                        <span className="font-medium">{(pile.utilizationRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-medium">{(pile.efficiency * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Note: Recommendations prioritize efficient material use while maintaining adequate safety margins.
                The most efficient option is listed first. Efficiency indicates how closely the pile capacity matches the required capacity.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recommendations available with current parameters.</p>
              <p className="text-sm mt-2">Try adjusting the soil profile or required capacity.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Design Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Consider these factors when finalizing your pile design:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Installation Considerations</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Verify availability of installation equipment for the selected pile dimensions</li>
                  <li>Consider site constraints and access for the equipment</li>
                  <li>Check for potential obstructions or buried utilities</li>
                  <li>Evaluate noise and vibration constraints during installation</li>
                  <li>Plan for material supply logistics</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Additional Engineering Checks</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Conduct settlement analysis for long-term performance</li>
                  <li>Evaluate group effects if multiple piles are used</li>
                  <li>Check for negative skin friction in areas with fill or soft soils</li>
                  <li>Consider cyclic loading effects if applicable</li>
                  <li>Verify pile performance under seismic conditions if required</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
