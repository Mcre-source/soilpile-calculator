
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
