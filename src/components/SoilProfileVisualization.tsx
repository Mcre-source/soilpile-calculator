
import { useEffect, useRef } from 'react';

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
  
  // Colors for different soil types
  const soilColors: Record<string, string> = {
    'sand-loose': '#E8D6A0',
    'sand-medium': '#DBCA96',
    'sand-dense': '#C9BD8F',
    'clay-soft': '#ADB5BD',
    'clay-medium': '#939BA3',
    'clay-stiff': '#6C757D',
    'silt': '#D3D3D3',
    'gravel': '#B4B4B4',
    'custom': '#EFEFEF'
  };
  
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
    
    // Draw water above ground if applicable
    if (waterTableDepth < 0) {
      const waterHeight = Math.abs(waterTableDepth) * 20;
      const waterY = groundLevel - waterHeight;
      ctx.fillStyle = 'rgba(135, 206, 250, 0.5)'; // Light blue with transparency
      ctx.fillRect(0, waterY, width, waterHeight);
      
      // Draw water surface pattern
      ctx.strokeStyle = 'rgba(70, 130, 180, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let x = 0; x < width; x += 10) {
        ctx.moveTo(x, waterY);
        ctx.lineTo(x + 5, waterY + 3);
        ctx.lineTo(x + 10, waterY);
      }
      
      ctx.stroke();
      
      // Draw water level label
      ctx.fillStyle = '#228be6';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('WATER LEVEL', 5, waterY + 12);
    }
    
    // Draw soil layers
    let currentDepth = 0;
    soilLayers.forEach(layer => {
      const yTop = groundLevel + currentDepth * scaleFactor;
      const layerHeight = layer.thickness * scaleFactor;
      
      // Draw soil layer
      ctx.fillStyle = soilColors[layer.type] || '#EFEFEF';
      ctx.fillRect(0, yTop, width, layerHeight);
      
      // Draw soil layer border
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yTop);
      ctx.lineTo(width, yTop);
      ctx.stroke();
      
      // Draw layer label
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${layer.type.replace('-', ' ').toUpperCase()}`, 5, yTop + layerHeight / 2 + 4);
      
      // Draw depth marker
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${currentDepth.toFixed(1)}m`, width - 5, yTop + 10);
      
      currentDepth += layer.thickness;
    });
    
    // Draw final depth marker
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${currentDepth.toFixed(1)}m`, width - 5, groundLevel + currentDepth * scaleFactor + 10);
    
    // Draw ground level line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(width, groundLevel);
    ctx.stroke();
    
    // Draw "GROUND LEVEL" label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('GROUND LEVEL', 5, groundLevel - 5);
    
    // Draw water table if below ground
    if (waterTableDepth > 0 && waterTableDepth < maxDepth) {
      const waterY = groundLevel + waterTableDepth * scaleFactor;
      
      // Draw water table line
      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      ctx.lineTo(width, waterY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw water table label
      ctx.fillStyle = '#228be6';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('WATER TABLE', 5, waterY - 5);
    }
    
    // Calculate pile position
    const pileWidth = Math.max(30, pileDiameter * 100);
    const pileX = width / 2 - pileWidth / 2;
    
    // Draw pile (including above-ground portion)
    const pileTopY = groundLevel - (pileTopElevation * 20);
    const pileEndY = groundLevel + pileLength * scaleFactor;
    const totalPileHeight = pileEndY - pileTopY;
    
    // Pile shaft
    let pileFillStyle = '#d3d3d3'; // Default concrete color
    
    if (pileProperties.material === 'steel') {
      pileFillStyle = '#a0a0a0'; // Steel color
    } else if (pileProperties.material === 'timber') {
      pileFillStyle = '#c19a6b'; // Timber color
    } else if (pileProperties.material === 'composite') {
      pileFillStyle = '#e0e0e0'; // Composite color
      
      // Create gradient for composite material
      const gradient = ctx.createLinearGradient(pileX, pileTopY, pileX + pileWidth, pileTopY);
      gradient.addColorStop(0, '#d8d8d8');
      gradient.addColorStop(0.3, '#e0e0e0');
      gradient.addColorStop(0.7, '#d0d0d0');
      gradient.addColorStop(1, '#d8d8d8');
      pileFillStyle = gradient;
    }

    ctx.fillStyle = pileFillStyle;
    ctx.fillRect(pileX, pileTopY, pileWidth, totalPileHeight);
    
    // If steel, draw hollow section
    if (pileProperties.material === 'steel' && pileProperties.wallThickness) {
      const wallThickness = pileProperties.wallThickness * 100;
      const innerWidth = pileWidth - (wallThickness * 2);
      
      if (innerWidth > 0) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(
          pileX + wallThickness, 
          pileTopY + wallThickness, 
          innerWidth, 
          totalPileHeight - (wallThickness * 2)
        );
      }
    }
    
    // Pile outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(pileX, pileTopY, pileWidth, totalPileHeight);
    
    // Pile dimension labels
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`D = ${pileDiameter.toFixed(2)}m`, width / 2, groundLevel + 14);
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`L = ${pileLength.toFixed(2)}m`, width / 2, (groundLevel + pileEndY) / 2);
    
    // Draw Top of Pile indicator
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Top of Pile (${pileTopElevation.toFixed(1)}m)`, pileX - 5, pileTopY + 5);
    
    // Draw horizontal line at pile top
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(0, pileTopY);
    ctx.lineTo(pileX, pileTopY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw force arrow for lateral load
    if (forceHeight > 0) {
      const arrowY = groundLevel - forceHeight * 20; // Scaling for visualization
      
      // Arrow line
      ctx.strokeStyle = '#e03131';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 4, arrowY);
      ctx.lineTo(pileX, arrowY);
      ctx.stroke();
      
      // Arrow head
      ctx.fillStyle = '#e03131';
      ctx.beginPath();
      ctx.moveTo(pileX, arrowY);
      ctx.lineTo(pileX - 10, arrowY - 5);
      ctx.lineTo(pileX - 10, arrowY + 5);
      ctx.closePath();
      ctx.fill();
      
      // Force label
      ctx.fillStyle = '#e03131';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`LATERAL LOAD AT h = ${forceHeight.toFixed(1)}m`, width / 4 - 120, arrowY - 5);
    } else {
      // Draw lateral load at ground level
      const arrowY = groundLevel;
      
      // Arrow line
      ctx.strokeStyle = '#e03131';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 4, arrowY);
      ctx.lineTo(pileX, arrowY);
      ctx.stroke();
      
      // Arrow head
      ctx.fillStyle = '#e03131';
      ctx.beginPath();
      ctx.moveTo(pileX, arrowY);
      ctx.lineTo(pileX - 10, arrowY - 5);
      ctx.lineTo(pileX - 10, arrowY + 5);
      ctx.closePath();
      ctx.fill();
      
      // Force label
      ctx.fillStyle = '#e03131';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('LATERAL LOAD AT GROUND LEVEL', width / 4 - 120, arrowY - 5);
    }
    
    // Draw legend
    const legendX = 10;
    const legendY = height - 70;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(legendX, legendY, 180, 60);
    ctx.strokeStyle = '#888';
    ctx.strokeRect(legendX, legendY, 180, 60);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PILE PROPERTIES:', legendX + 5, legendY + 15);
    ctx.font = '10px Arial';
    ctx.fillText(`Material: ${pileProperties.material.toUpperCase()}`, legendX + 5, legendY + 30);
    
    if (pileProperties.material === 'steel' && pileProperties.wallThickness) {
      ctx.fillText(`Wall thickness: ${(pileProperties.wallThickness * 1000).toFixed(0)}mm`, legendX + 5, legendY + 45);
    } else if (pileProperties.material === 'composite' && pileProperties.compositeMaterials) {
      const compositeDesc = `${pileProperties.compositeMaterials.material1}/${pileProperties.compositeMaterials.material2}`;
      ctx.fillText(`Composite: ${compositeDesc}`, legendX + 5, legendY + 45);
    }
    
  }, [soilLayers, pileProperties, waterTableDepth, forceHeight, pileTopElevation]);
  
  // Calculate total depth of all soil layers
  const calculateTotalDepth = (layers: any[]): number => {
    return layers.reduce((sum, layer) => sum + layer.thickness, 0);
  };

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
