
import { useEffect, useRef } from 'react';

interface SoilProfileVisualizationProps {
  soilLayers: any[];
  pileProperties: any;
  waterTableDepth: number;
  forceHeight: number;
}

const SoilProfileVisualization = ({ 
  soilLayers, 
  pileProperties, 
  waterTableDepth, 
  forceHeight 
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
    
    // Adjust for water above ground
    const aboveGroundMargin = waterTableDepth < 0 ? Math.min(Math.abs(waterTableDepth) * 10, 50) : 0;
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
      const waterHeight = aboveGroundMargin;
      ctx.fillStyle = 'rgba(135, 206, 250, 0.5)'; // Light blue with transparency
      ctx.fillRect(0, margin, width, waterHeight);
      
      // Draw water surface pattern
      ctx.strokeStyle = 'rgba(70, 130, 180, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let x = 0; x < width; x += 10) {
        ctx.moveTo(x, margin);
        ctx.lineTo(x + 5, margin + 3);
        ctx.lineTo(x + 10, margin);
      }
      
      ctx.stroke();
      
      // Draw water level label
      ctx.fillStyle = '#228be6';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('WATER LEVEL', 5, margin + waterHeight / 2);
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
    
    // Draw pile
    const pileWidth = Math.max(30, pileDiameter * 100);
    const pileX = width / 2 - pileWidth / 2;
    const pileY = groundLevel;
    const pileYEnd = groundLevel + pileLength * scaleFactor;
    
    // Pile shaft
    ctx.fillStyle = pileProperties.material === 'concrete' ? '#d3d3d3' : 
                    pileProperties.material === 'steel' ? '#a0a0a0' : 
                    pileProperties.material === 'timber' ? '#c19a6b' : '#e0e0e0';
    ctx.fillRect(pileX, pileY, pileWidth, pileYEnd - pileY);
    
    // Pile outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(pileX, pileY, pileWidth, pileYEnd - pileY);
    
    // Pile dimension labels
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`D = ${pileDiameter.toFixed(2)}m`, width / 2, pileY + 14);
    
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`L = ${pileLength.toFixed(2)}m`, width / 2, (pileY + pileYEnd) / 2);
    
    // Draw force arrow for lateral load
    if (forceHeight > 0) {
      const arrowY = groundLevel - forceHeight * scaleFactor;
      
      // Arrow line
      ctx.strokeStyle = '#e03131';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 4, groundLevel - forceHeight * scaleFactor);
      ctx.lineTo(pileX, groundLevel - forceHeight * scaleFactor);
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
    const legendY = height - 50;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(legendX, legendY, 150, 40);
    ctx.strokeStyle = '#888';
    ctx.strokeRect(legendX, legendY, 150, 40);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PILE PROPERTIES:', legendX + 5, legendY + 15);
    ctx.font = '10px Arial';
    ctx.fillText(`Material: ${pileProperties.material.toUpperCase()}`, legendX + 5, legendY + 30);
    
  }, [soilLayers, pileProperties, waterTableDepth, forceHeight]);
  
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
          height={550} 
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
