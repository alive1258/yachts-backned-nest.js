export interface YachtCabinConfig {
  type: string;
  count: number;
}

export interface YachtSpecifications {
  accommodation: {
    guestsCruising: number;
    guestsSleeping: number;
    staterooms: number;
    cabinConfig: YachtCabinConfig[];
    crew: number;
  };
  construction: {
    builtYear: number;
    refitYear: number;
    builder: string;
    hullMaterial: string;
    exteriorDesigner: string;
    interiorDesigner: string;
  };
  dimensions: {
    length: string;
    beam: string;
    draft: string;
    grossTonnage: string;
  };
  performance: {
    cruisingSpeed: string;
    maxSpeed: string;
    range: string;
    engines: string;
    generators: string;
  };
  classification: {
    classification: string;
    flag: string;
  };
  amenities: string[];
}
