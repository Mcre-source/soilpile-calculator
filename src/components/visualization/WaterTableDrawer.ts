
export interface WaterTableDrawerProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  groundLevel: number;
  waterTableDepth: number;
  maxDepth: number;
  scaleFactor: number;
}

export const drawWaterTable = ({
  ctx,
  width,
  groundLevel,
  waterTableDepth,
  maxDepth,
  scaleFactor
}: WaterTableDrawerProps) => {
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
};
