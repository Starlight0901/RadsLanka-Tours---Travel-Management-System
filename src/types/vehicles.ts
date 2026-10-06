export type VehicleImage = {
  alt: string
  caption?: string
  src?: string
}

export type VehicleSpec = {
  label: string
  value: string
  icon: string
}

export type CatalogVehicle = {
  id: string
  slug: string
  name: string
  model: string
  type: 'sedan' | 'van' | 'suv' | 'coach'
  typeLabel: string
  idealFor: string
  description: string
  badge?: string
  passengerCapacity: number
  specs: VehicleSpec[]
  features: string[]
  image: VehicleImage
  published: boolean
}
