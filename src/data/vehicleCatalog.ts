import { mockVehicles } from '@/data/vehicles.ts'
import type { CatalogVehicle } from '@/types/vehicles.ts'

export function listPublishedVehicles(): CatalogVehicle[] {
  return mockVehicles.filter((vehicle) => vehicle.published)
}
