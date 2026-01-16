export interface AssetLocation {
  id?: number;         // Optional because new points don't have an ID yet
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}