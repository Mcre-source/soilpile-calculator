
// Soil types and properties
export const SOIL_TYPES = [
  { id: 'sand-loose', name: 'Sand (Loose)', frictionAngle: 30, cohesion: 0, unitWeight: 16, description: 'Loose, poorly graded sand' },
  { id: 'sand-medium', name: 'Sand (Medium)', frictionAngle: 33, cohesion: 0, unitWeight: 18, description: 'Medium dense, well-graded sand' },
  { id: 'sand-dense', name: 'Sand (Dense)', frictionAngle: 38, cohesion: 0, unitWeight: 20, description: 'Dense, compacted sand' },
  { id: 'clay-soft', name: 'Clay (Soft)', frictionAngle: 0, cohesion: 20, unitWeight: 16, description: 'Soft to firm clay' },
  { id: 'clay-medium', name: 'Clay (Medium)', frictionAngle: 0, cohesion: 50, unitWeight: 18, description: 'Medium stiff clay' },
  { id: 'clay-stiff', name: 'Clay (Stiff)', frictionAngle: 0, cohesion: 100, unitWeight: 20, description: 'Stiff to very stiff clay' },
  { id: 'silt', name: 'Silt', frictionAngle: 28, cohesion: 5, unitWeight: 17, description: 'Inorganic silt with low plasticity' },
  { id: 'gravel', name: 'Gravel', frictionAngle: 40, cohesion: 0, unitWeight: 21, description: 'Well-graded gravel with sand' },
  { id: 'custom', name: 'Custom Soil', frictionAngle: 30, cohesion: 0, unitWeight: 18, description: 'User-defined soil properties' }
];

// Default soil layer properties
export const DEFAULT_SOIL_LAYER = {
  type: 'sand-medium',
  thickness: 5,
  frictionAngle: 33,
  cohesion: 0,
  unitWeight: 18
};

// Pile material properties
export const PILE_MATERIALS = [
  {
    id: 'concrete',
    name: 'Concrete',
    yield_strength: 30, // MPa
    elasticity: 30000, // MPa
    unit_weight: 25, // kN/m³
    allowable_stress: 15, // MPa
    type: 'solid'
  },
  {
    id: 'steel',
    name: 'Steel',
    yield_strength: 355, // MPa
    elasticity: 210000, // MPa
    unit_weight: 78, // kN/m³
    allowable_stress: 235, // MPa
    type: 'tubular',
    default_wall_thickness: 0.02 // 20mm default wall thickness
  },
  {
    id: 'timber',
    name: 'Timber',
    yield_strength: 10, // MPa
    elasticity: 11000, // MPa
    unit_weight: 10, // kN/m³
    allowable_stress: 8, // MPa
    type: 'solid'
  },
  {
    id: 'composite',
    name: 'Composite',
    yield_strength: 50, // MPa
    elasticity: 40000, // MPa
    unit_weight: 20, // kN/m³
    allowable_stress: 25, // MPa
    type: 'composite',
    composite_material_1: 'GFRP',
    composite_material_2: 'Concrete Core',
    composite_ratio: 0.3 // 30% fiber reinforcement ratio
  }
];

// Standard pile diameters (m)
export const STANDARD_PILE_DIAMETERS = [0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5];

// Safety factors
export const SAFETY_FACTORS = {
  bearing: 2.5,
  structural: 2.0,
  sliding: 1.5
};

// Standard composite materials
export const COMPOSITE_MATERIALS = [
  { id: 'GFRP', name: 'Glass Fiber Reinforced Polymer', elasticity: 35000, yield_strength: 60 },
  { id: 'CFRP', name: 'Carbon Fiber Reinforced Polymer', elasticity: 150000, yield_strength: 150 },
  { id: 'BFRP', name: 'Basalt Fiber Reinforced Polymer', elasticity: 45000, yield_strength: 80 },
  { id: 'AFRP', name: 'Aramid Fiber Reinforced Polymer', elasticity: 80000, yield_strength: 100 }
];

// Standard composite core materials
export const COMPOSITE_CORE_MATERIALS = [
  { id: 'Concrete Core', name: 'Concrete Core', elasticity: 30000, yield_strength: 30 },
  { id: 'Sand Core', name: 'Sand-filled Core', elasticity: 10000, yield_strength: 5 },
  { id: 'Steel Core', name: 'Steel Core', elasticity: 210000, yield_strength: 355 },
  { id: 'Timber Core', name: 'Timber Core', elasticity: 11000, yield_strength: 10 }
];
