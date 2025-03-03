
/**
 * Format a number with specified units and decimal places
 */
export const formatNumber = (value: number, units: string, decimals = 2) => {
  return `${value.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })} ${units}`;
};

/**
 * Get the utilization status based on a ratio
 */
export const getUtilizationStatus = (ratio: number) => {
  if (ratio <= 0.7) return { status: 'success', text: 'Adequate', icon: 'CheckCircle' };
  if (ratio <= 1.0) return { status: 'warning', text: 'Acceptable', icon: 'AlertCircle' };
  return { status: 'danger', text: 'Inadequate', icon: 'XCircle' };
};
