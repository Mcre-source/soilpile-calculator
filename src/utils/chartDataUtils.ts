
export interface DeflectionDataPoint {
  depth: number;
  value: number;
}

export const formatChartData = (data: DeflectionDataPoint[], pileLength?: number) => {
  if (!data || !Array.isArray(data)) return [];
  
  // Process the data to format it for the charts
  const formattedData = data.map(point => ({
    depth: Number(point.depth.toFixed(2)),
    value: Number(point.value.toFixed(4))
  }));

  // If pile length is provided, filter data to only include points within the pile length
  if (pileLength) {
    return formattedData.filter(point => point.depth <= pileLength);
  }
  
  return formattedData;
};
