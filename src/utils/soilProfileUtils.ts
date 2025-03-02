
// Color mapping for different soil types
export const soilColors: Record<string, string> = {
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

// Calculate total depth of all soil layers
export const calculateTotalDepth = (layers: any[]): number => {
  return layers.reduce((sum, layer) => sum + layer.thickness, 0);
};

// Get gradient for soil layer
export const getSoilGradient = (ctx: CanvasRenderingContext2D, soilType: string, y: number, height: number): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  const baseColor = soilColors[soilType] || soilColors['custom'];
  
  // Create a slightly darker shade for gradient effect
  const darkerShade = adjustBrightness(baseColor, -15);
  
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(1, darkerShade);
  
  return gradient;
};

// Adjust color brightness (helper function)
const adjustBrightness = (hex: string, percent: number): string => {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));

  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
