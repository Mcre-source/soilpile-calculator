
export interface PileDrawerProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  groundLevel: number;
  pileProperties: any;
  pileTopElevation: number;
  scaleFactor: number;
}

export const drawPile = ({
  ctx,
  width,
  groundLevel,
  pileProperties,
  pileTopElevation,
  scaleFactor
}: PileDrawerProps) => {
  const pileDiameter = pileProperties.diameter;
  const pileLength = pileProperties.length;
  const pileWidth = Math.max(30, pileDiameter * 100);
  const pileX = width / 2 - pileWidth / 2;
  
  // Draw pile (including above-ground portion)
  const pileTopY = groundLevel - (pileTopElevation * 20);
  const pileEndY = groundLevel + pileLength * scaleFactor;
  const totalPileHeight = pileEndY - pileTopY;
  
  // Pile shaft
  let pileFillStyle: string | CanvasGradient = '#d3d3d3'; // Default concrete color
  
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

  // Direct assignment of fillStyle with either string or gradient
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
  
  // Draw pile properties legend
  const legendX = 10;
  const legendY = width - 70;
  
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
};
