
export interface LateralForceDrawerProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  groundLevel: number;
  forceHeight: number;
  pileX: number;
}

export const drawLateralForce = ({
  ctx,
  width,
  groundLevel,
  forceHeight,
  pileX
}: LateralForceDrawerProps) => {
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
};
