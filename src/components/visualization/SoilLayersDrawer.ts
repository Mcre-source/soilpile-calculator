
import { soilColors } from '../../utils/soilProfileUtils';

export interface SoilLayersDrawerProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  groundLevel: number;
  soilLayers: any[];
  scaleFactor: number;
}

export const drawSoilLayers = ({
  ctx,
  width,
  groundLevel,
  soilLayers,
  scaleFactor
}: SoilLayersDrawerProps) => {
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
};
