
/**
 * Utility functions for formatting chart data and labels
 */

export const formatTooltipValue = (value: number, name: string, props: any): [string, string] => {
  if (props.payload.originalValue !== undefined) {
    const displayValue = props.payload.originalValue * 1000;
    return [`${displayValue.toFixed(2)} ${props.unit}`, name];
  }
  
  if (Math.abs(value) < 0.001) {
    return [`${value.toExponential(4)} ${props.unit}`, name];
  }
  return [`${value.toFixed(6)} ${props.unit}`, name];
};

export const formatAxisTick = (value: number, unit: string): string => {
  const displayValue = value * (unit === 'mm' ? 1 : 1000);
  if (Math.abs(displayValue) < 0.001) {
    return displayValue.toExponential(2);
  }
  return displayValue.toFixed(Math.abs(displayValue) < 0.1 ? 2 : 1);
};
