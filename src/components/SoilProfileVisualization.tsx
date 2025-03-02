
import { useEffect, useRef } from 'react';
import { calculateTotalDepth } from '../utils/soilProfileUtils';
import { drawWaterTable } from './visualization/WaterTableDrawer';
import { drawSoilLayers } from './visualization/SoilLayersDrawer';
import { drawPile } from './visualization/PileDrawer';
import { drawLateralForce } from './visualization/LateralForceDrawer';

interface SoilProfileVisualizationProps {
  soilLayers: any[];
  pileProperties: any;
  waterTableDepth: number;
  forceHeight: number;
  pileTopElevation: number;
}

const SoilProfileVisualization = ({ 
  soilLayers, 
  pileProperties, 
  waterTableDepth, 
  forceHeight, 
  pileTopElevation 
}: SoilProfileVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the soil profile visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate scaling factors
    const maxDepth = calculateTotalDepth(soilLayers);
    const pileLength = pileProperties.length;
    const pileDiameter = pileProperties.diameter;
    
    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const margin = 20;
    
    // Adjust for water above ground and pile top elevation
    const maxTopElevation = Math.max(pileTopElevation, waterTableDepth < 0 ? Math.abs(waterTableDepth) : 0);
    const aboveGroundMargin = maxTopElevation > 0 ? Math.min(maxTopElevation * 20, 100) : 0;
    const totalHeight = height - 2 * margin - aboveGroundMargin;
    const groundLevel = margin + aboveGroundMargin;
    const scaleFactor = totalHeight / Math.max(maxDepth, pileLength);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background (sky)
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, width, groundLevel);
    
    // Draw water table
    drawWaterTable({
      ctx,
      width,
      groundLevel,
      waterTableDepth,
      maxDepth,
      scaleFactor
    });
    
    // Draw soil layers
    drawSoilLayers({
      ctx,
      width,
      groundLevel,
      soilLayers,
      scaleFactor
    });
    
    // Calculate pile position for the lateral force drawer
    const pileWidth = Math.max(30, pileDiameter * 100);
    const pileX = width / 2 - pileWidth / 2;
    
    // Draw lateral force
    drawLateralForce({
      ctx,
      width,
      groundLevel,
      forceHeight,
      pileX
    });
    
    // Draw pile
    drawPile({
      ctx,
      width,
      groundLevel,
      pileProperties,
      pileTopElevation,
      scaleFactor
    });
    
  }, [soilLayers, pileProperties, waterTableDepth, forceHeight, pileTopElevation]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <h3 className="text-lg font-medium">Soil Profile Visualization</h3>
      <div className="border rounded-md p-1 bg-white">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={600} 
          className="w-full" 
        />
      </div>
      <p className="text-xs text-muted-foreground">
        This is a schematic representation and not to scale.
      </p>
    </div>
  );
};

export default SoilProfileVisualization;
