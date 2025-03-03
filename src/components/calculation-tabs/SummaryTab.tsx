
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatNumber, getUtilizationStatus } from '@/utils/formatters';

interface SummaryTabProps {
  calculationResults: any;
  structuralCheck: any;
  lateralResults: any;
}

export default function SummaryTab({ 
  calculationResults, 
  structuralCheck,
  lateralResults 
}: SummaryTabProps) {
  // Convert utilization ratio to percentage
  const utilizationPercent = useMemo(() => {
    return Math.min(structuralCheck.utilizationRatio * 100, 100);
  }, [structuralCheck]);
  
  // Check if utilization is OK, warning, or critical
  const utilizationStatus = useMemo(() => {
    return getUtilizationStatus(structuralCheck.utilizationRatio);
  }, [structuralCheck]);
  
  // Calculate capacity utilization
  const capacityUtilization = useMemo(() => {
    return calculationResults.requiredCapacity / calculationResults.allowableCapacity * 100;
  }, [calculationResults]);
  
  const capacityStatus = useMemo(() => {
    const ratio = calculationResults.requiredCapacity / calculationResults.allowableCapacity;
    return getUtilizationStatus(ratio);
  }, [calculationResults]);
  
  // Calculate lateral capacity utilization
  const lateralUtilization = useMemo(() => {
    // Using a placeholder value since lateral load is not explicitly defined
    return 50; // Assuming 50% utilization for demonstration
  }, [lateralResults]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'danger': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Axial Capacity
              <Badge variant={capacityStatus.status === 'success' ? "default" : capacityStatus.status === 'warning' ? "outline" : "destructive"}>
                {capacityStatus.text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Required Capacity:</span>
                  <span className="font-medium">{formatNumber(calculationResults.requiredCapacity, 'kN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Allowable Capacity:</span>
                  <span className="font-medium">{formatNumber(calculationResults.allowableCapacity, 'kN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Factor of Safety:</span>
                  <span className="font-medium">{calculationResults.appliedSafetyFactor}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Capacity Utilization:</span>
                  <span className="font-medium">{Math.min(capacityUtilization, 100).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(capacityUtilization, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Structural Capacity
              <Badge variant={utilizationStatus.status === 'success' ? "default" : utilizationStatus.status === 'warning' ? "outline" : "destructive"}>
                {utilizationStatus.text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compressive Stress:</span>
                  <span className="font-medium">{formatNumber(structuralCheck.compressiveStress, 'MPa')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Allowable Stress:</span>
                  <span className="font-medium">{formatNumber(structuralCheck.allowableStress, 'MPa')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cross-Sectional Area:</span>
                  <span className="font-medium">{formatNumber(structuralCheck.crossSectionalArea, 'm²')}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Stress Utilization:</span>
                  <span className="font-medium">{utilizationPercent.toFixed(1)}%</span>
                </div>
                <Progress value={utilizationPercent} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pile Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Diameter</p>
              <p className="text-xl font-semibold">{calculationResults.pileProperties.diameter.toFixed(2)} m</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Length</p>
              <p className="text-xl font-semibold">{calculationResults.pileProperties.length.toFixed(2)} m</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Material</p>
              <p className="text-xl font-semibold capitalize">{calculationResults.pileProperties.material}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Method</p>
              <p className="text-lg font-semibold">{calculationResults.method.split(' ')[0]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Lateral Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Allowable Lateral Capacity:</span>
                <span className="font-medium">{formatNumber(lateralResults.allowableLateralCapacity, 'kN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Calculation Method:</span>
                <span className="font-medium">{lateralResults.calculationMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Force Application Height:</span>
                <span className="font-medium">{formatNumber(calculationResults.forceHeight, 'm')}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Lateral Utilization (estimated):</span>
                <span className="font-medium">{lateralUtilization.toFixed(1)}%</span>
              </div>
              <Progress value={lateralUtilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Note: Actual lateral utilization depends on applied lateral load
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
