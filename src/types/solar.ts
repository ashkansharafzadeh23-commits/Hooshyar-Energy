export type BuildingType = 'house' | 'factory' | 'warehouse' | 'farm';

export interface RoofConfig {
  type: 'gable' | 'flat';
  tilt: number; // degrees
  azimuth: number; // degrees
}

export interface PanelInstance {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  efficiency: number; // 0 to 1
}
