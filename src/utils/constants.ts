
// Soil type definitions and properties
export const SOIL_TYPES = [
  { id: 'sand-loose', name: 'Sand (Loose)', frictionAngle: 30, cohesion: 0, unitWeight: 17 },
  { id: 'sand-medium', name: 'Sand (Medium)', frictionAngle: 33, cohesion: 0, unitWeight: 18 },
  { id: 'sand-dense', name: 'Sand (Dense)', frictionAngle: 38, cohesion: 0, unitWeight: 20 },
  { id: 'clay-soft', name: 'Clay (Soft)', frictionAngle: 0, cohesion: 20, unitWeight: 16 },
  { id: 'clay-medium', name: 'Clay (Medium)', frictionAngle: 0, cohesion: 50, unitWeight: 17 },
  { id: 'clay-stiff', name: 'Clay (Stiff)', frictionAngle: 0, cohesion: 100, unitWeight: 19 },
  { id: 'silt', name: 'Silt', frictionAngle: 28, cohesion: 5, unitWeight: 17 },
  { id: 'gravel', name: 'Gravel', frictionAngle: 40, cohesion: 0, unitWeight: 21 },
  { id: 'custom', name: 'Custom', frictionAngle: 0, cohesion: 0, unitWeight: 18 },
];

// Pile material definitions and properties
export const PILE_MATERIALS = [
  { id: 'concrete', name: 'Concrete', yield_strength: 25, elasticity: 30000, unit_weight: 25 },
  { id: 'steel', name: 'Steel', yield_strength: 355, elasticity: 210000, unit_weight: 78 },
  { id: 'timber', name: 'Timber', yield_strength: 20, elasticity: 12000, unit_weight: 7 },
  { id: 'composite', name: 'Composite', yield_strength: 150, elasticity: 40000, unit_weight: 18 },
];

// Default values for new soil layers
export const DEFAULT_SOIL_LAYER = {
  type: 'sand-medium',
  thickness: 2,
  frictionAngle: 33,
  cohesion: 0,
  unitWeight: 18,
};

// Standard pile dimensions (diameter in meters)
export const STANDARD_PILE_DIAMETERS = [0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0];

// Safety factors
export const SAFETY_FACTORS = {
  bearing: 2.5,
  sliding: 1.5,
  overturning: 2.0,
  structural: 1.67,
};

// Calculation methods
export const CALCULATION_METHODS = [
  { id: 'alpha', name: 'Alpha Method (Total Stress)' },
  { id: 'beta', name: 'Beta Method (Effective Stress)' },
  { id: 'lambda', name: 'Lambda Method' },
  { id: 'tomlinson', name: 'Tomlinson Method' },
];
