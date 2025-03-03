
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummaryTab from './calculation-tabs/SummaryTab';
import DetailsTab from './calculation-tabs/DetailsTab';
import RecommendationsTab from './calculation-tabs/RecommendationsTab';
import AssumptionsTab from './calculation-tabs/AssumptionsTab';

interface CalculationResultsProps {
  calculationResults: any;
  structuralCheck: any;
  lateralResults: any;
  recommendedPiles: any[];
  deflectionData: any;
}

export default function CalculationResults({ 
  calculationResults, 
  structuralCheck, 
  lateralResults,
  recommendedPiles,
  deflectionData
}: CalculationResultsProps) {
  return (
    <div className="space-y-6 fade-in">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Calculation Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <SummaryTab 
            calculationResults={calculationResults} 
            structuralCheck={structuralCheck}
            lateralResults={lateralResults}
          />
        </TabsContent>
        
        <TabsContent value="details">
          <DetailsTab 
            calculationResults={calculationResults}
            structuralCheck={structuralCheck}
            deflectionData={deflectionData}
          />
        </TabsContent>
        
        <TabsContent value="recommendations">
          <RecommendationsTab recommendedPiles={recommendedPiles} />
        </TabsContent>
        
        <TabsContent value="assumptions">
          <AssumptionsTab 
            calculationResults={calculationResults} 
            safetyFactors={SAFETY_FACTORS}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Import needed for the AssumptionsTab
import { SAFETY_FACTORS } from '../utils/constants';
