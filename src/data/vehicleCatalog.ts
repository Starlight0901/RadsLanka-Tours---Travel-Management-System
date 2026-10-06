import { mockVehicles } from '@/data/vehicles.ts'
import type { CatalogVehicle } from '@/types/vehicles.ts'

export function listPublishedVehicles(): CatalogVehicle[] {
  return mockVehicles.filter((vehicle) => vehicle.published)
}

export const vehicleTypeFilters = [
  { value: 'all', label: 'All fleet' },
  { value: 'sedan', label: 'Sedans' },
  { value: 'van', label: 'Vans' },
  { value: 'suv', label: '4x4 SUV' },
  { value: 'coach', label: 'Mini coach' },
] as const

export function filterPublishedVehicles(type: string): CatalogVehicle[] {
  const vehicles = listPublishedVehicles()
  if (type === 'all') return vehicles
  return vehicles.filter((vehicle) => vehicle.type === type)
}

export function matchVehicleForParty(travelers: number, terrain: string): CatalogVehicle {
  const vehicles = listPublishedVehicles()
  if (terrain === 'safari' || terrain === 'highlands') {
    return vehicles.find((vehicle) => vehicle.type === 'suv') ?? vehicles[0]
  }
  if (travelers >= 8) {
    return vehicles.find((vehicle) => vehicle.type === 'coach') ?? vehicles[0]
  }
  if (travelers >= 4) {
    return vehicles.find((vehicle) => vehicle.type === 'van') ?? vehicles[0]
  }
  return vehicles.find((vehicle) => vehicle.type === 'sedan') ?? vehicles[0]
}
