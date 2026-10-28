export const DESTINATION_SUBTITLE_MAX = 160
export const DESTINATION_SHORT_DESCRIPTION_MAX = 1200
export const DESTINATION_OVERVIEW_TITLE_MAX = 120
export const DESTINATION_OVERVIEW_DESCRIPTION_MAX = 12000
export const DESTINATION_OTHER_CHARACTERISTIC_MAX = 60
export const DESTINATION_IDEAL_FOR_MAX_ITEMS = 20
export const DESTINATION_IDEAL_FOR_LABEL_MAX = 40
export const DESTINATION_HIGHLIGHTS_MAX_ITEMS = 12
export const DESTINATION_HIGHLIGHT_TITLE_MAX = 60
export const DESTINATION_HIGHLIGHT_DETAIL_MAX = 160
export const DESTINATION_EXPERIENCES_MAX_ITEMS = 40
export const DESTINATION_EXPERIENCE_TITLE_MAX = 80
export const DESTINATION_EXPERIENCE_DESCRIPTION_MAX = 400

export const MONTHS = [
  { value: 1, short: 'Jan', label: 'January' },
  { value: 2, short: 'Feb', label: 'February' },
  { value: 3, short: 'Mar', label: 'March' },
  { value: 4, short: 'Apr', label: 'April' },
  { value: 5, short: 'May', label: 'May' },
  { value: 6, short: 'Jun', label: 'June' },
  { value: 7, short: 'Jul', label: 'July' },
  { value: 8, short: 'Aug', label: 'August' },
  { value: 9, short: 'Sep', label: 'September' },
  { value: 10, short: 'Oct', label: 'October' },
  { value: 11, short: 'Nov', label: 'November' },
  { value: 12, short: 'Dec', label: 'December' },
] as const

/** A recurring annual season. Months are 1-12; endMonth before startMonth wraps past December. */
export type MonthRange = { startMonth: number; endMonth: number }

export function isMonth(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12
}

export function monthsInRange(range: MonthRange): number[] {
  const months: number[] = []
  let month = range.startMonth
  for (let step = 0; step < 12; step += 1) {
    months.push(month)
    if (month === range.endMonth) {
      break
    }
    month = month === 12 ? 1 : month + 1
  }
  return months
}

export function monthLabel(month: number): string {
  return MONTHS[month - 1]?.label ?? ''
}

export function formatMonthRange(range: MonthRange | null | undefined): string {
  if (!range) {
    return ''
  }
  if (range.startMonth === range.endMonth) {
    return monthLabel(range.startMonth)
  }
  return `${monthLabel(range.startMonth)}–${monthLabel(range.endMonth)}`
}

export const SRI_LANKA_PROVINCES = [
  {
    id: 'western',
    label: 'Western Province',
    districts: [
      { id: 'colombo', label: 'Colombo' },
      { id: 'gampaha', label: 'Gampaha' },
      { id: 'kalutara', label: 'Kalutara' },
    ],
  },
  {
    id: 'central',
    label: 'Central Province',
    districts: [
      { id: 'kandy', label: 'Kandy' },
      { id: 'matale', label: 'Matale' },
      { id: 'nuwara-eliya', label: 'Nuwara Eliya' },
    ],
  },
  {
    id: 'southern',
    label: 'Southern Province',
    districts: [
      { id: 'galle', label: 'Galle' },
      { id: 'matara', label: 'Matara' },
      { id: 'hambantota', label: 'Hambantota' },
    ],
  },
  {
    id: 'northern',
    label: 'Northern Province',
    districts: [
      { id: 'jaffna', label: 'Jaffna' },
      { id: 'kilinochchi', label: 'Kilinochchi' },
      { id: 'mannar', label: 'Mannar' },
      { id: 'mullaitivu', label: 'Mullaitivu' },
      { id: 'vavuniya', label: 'Vavuniya' },
    ],
  },
  {
    id: 'eastern',
    label: 'Eastern Province',
    districts: [
      { id: 'batticaloa', label: 'Batticaloa' },
      { id: 'ampara', label: 'Ampara' },
      { id: 'trincomalee', label: 'Trincomalee' },
    ],
  },
  {
    id: 'north-western',
    label: 'North Western Province',
    districts: [
      { id: 'kurunegala', label: 'Kurunegala' },
      { id: 'puttalam', label: 'Puttalam' },
    ],
  },
  {
    id: 'north-central',
    label: 'North Central Province',
    districts: [
      { id: 'anuradhapura', label: 'Anuradhapura' },
      { id: 'polonnaruwa', label: 'Polonnaruwa' },
    ],
  },
  {
    id: 'uva',
    label: 'Uva Province',
    districts: [
      { id: 'badulla', label: 'Badulla' },
      { id: 'monaragala', label: 'Monaragala' },
    ],
  },
  {
    id: 'sabaragamuwa',
    label: 'Sabaragamuwa Province',
    districts: [
      { id: 'ratnapura', label: 'Ratnapura' },
      { id: 'kegalle', label: 'Kegalle' },
    ],
  },
] as const

export type ProvinceId = (typeof SRI_LANKA_PROVINCES)[number]['id']

export function findProvince(id: string) {
  return SRI_LANKA_PROVINCES.find((province) => province.id === id)
}

export function findDistrict(id: string): { province: (typeof SRI_LANKA_PROVINCES)[number]; label: string } | undefined {
  for (const province of SRI_LANKA_PROVINCES) {
    const district = province.districts.find((item) => item.id === id)
    if (district) {
      return { province, label: district.label }
    }
  }
  return undefined
}

export function districtBelongsToProvince(districtId: string, provinceId: string): boolean {
  return findDistrict(districtId)?.province.id === provinceId
}

export function formatLocation(provinceId: string, districtId: string): string {
  const district = findDistrict(districtId)
  const province = findProvince(provinceId) ?? district?.province
  return [district?.label, province?.label].filter(Boolean).join(', ')
}

export const STAY_UNITS = [
  { id: 'morning', label: 'Morning', counted: false },
  { id: 'evening', label: 'Evening', counted: false },
  { id: 'days', label: 'Days', counted: true },
  { id: 'nights', label: 'Nights', counted: true },
] as const

export type StayUnit = (typeof STAY_UNITS)[number]['id']

export const STAY_VALUE_MAX = 14

export type RecommendedStay = { unit: StayUnit; value: number | null }

export function isStayUnit(value: unknown): value is StayUnit {
  return STAY_UNITS.some((unit) => unit.id === value)
}

export function isCountedStayUnit(unit: StayUnit): boolean {
  return unit === 'days' || unit === 'nights'
}

export function formatStay(stay: RecommendedStay | null | undefined): string {
  if (!stay) {
    return ''
  }
  if (stay.unit === 'morning') {
    return 'Morning'
  }
  if (stay.unit === 'evening') {
    return 'Evening'
  }
  const value = stay.value ?? 1
  const noun = stay.unit === 'days' ? 'day' : 'night'
  return `${value} ${noun}${value === 1 ? '' : 's'}`
}

export const OTHER_CHARACTERISTIC_ID = 'other'

export const DESTINATION_CHARACTERISTICS = [
  { id: 'wildlife-national-parks', label: 'Wildlife & National Parks' },
  { id: 'coastal-beaches', label: 'Coastal & Beaches' },
  { id: 'hill-country', label: 'Hill Country' },
  { id: 'tea-estates-plantations', label: 'Tea Estates & Plantations' },
  { id: 'heritage-ancient-cities', label: 'Heritage & Ancient Cities' },
  { id: 'cultural-religious-sites', label: 'Cultural & Religious Sites' },
  { id: 'nature-scenic-landscapes', label: 'Nature & Scenic Landscapes' },
  { id: 'adventure-hiking', label: 'Adventure & Hiking' },
  { id: 'urban-city-experiences', label: 'Urban & City Experiences' },
  { id: OTHER_CHARACTERISTIC_ID, label: 'Other' },
] as const

export function isCharacteristicId(value: unknown): value is string {
  return DESTINATION_CHARACTERISTICS.some((item) => item.id === value)
}

/** Public listing region buttons. Matching uses saved location and destination-type fields only. */
export const DESTINATION_LISTING_FILTERS = [
  { id: 'all', label: 'All regions' },
  {
    id: 'cultural-triangle',
    label: 'Cultural Triangle',
    districts: ['matale', 'anuradhapura', 'polonnaruwa'],
    characteristics: ['heritage-ancient-cities'],
  },
  {
    id: 'tea-country',
    label: 'Tea Country',
    districts: ['nuwara-eliya'],
    characteristics: ['tea-estates-plantations'],
  },
  {
    id: 'wildlife',
    label: 'Wildlife',
    characteristics: ['wildlife-national-parks'],
  },
  {
    id: 'southern-coast',
    label: 'Southern Coast',
    provinces: ['southern'],
    districts: ['galle', 'matara', 'hambantota'],
  },
  {
    id: 'kandy',
    label: 'Kandy',
    districts: ['kandy'],
  },
] as const

export type DestinationListingFilterId = (typeof DESTINATION_LISTING_FILTERS)[number]['id']

export function destinationMatchesListingFilter(
  destination: { glance: { province: string; district: string; characteristics: string[] } },
  filterId: DestinationListingFilterId,
): boolean {
  if (filterId === 'all') {
    return true
  }
  const filter = DESTINATION_LISTING_FILTERS.find((item) => item.id === filterId)
  if (!filter || filter.id === 'all') {
    return false
  }
  if ('districts' in filter && filter.districts.some((id) => id === destination.glance.district)) {
    return true
  }
  if ('provinces' in filter && filter.provinces.some((id) => id === destination.glance.province)) {
    return true
  }
  if (
    'characteristics' in filter &&
    filter.characteristics.some((id) => destination.glance.characteristics.includes(id))
  ) {
    return true
  }
  return false
}

/** Display labels in catalogue order; "Other" is replaced by the custom value when one is given. */
export function characteristicLabels(ids: string[], other: string): string[] {
  return DESTINATION_CHARACTERISTICS.filter((item) => ids.includes(item.id)).flatMap((item) => {
    if (item.id !== OTHER_CHARACTERISTIC_ID) {
      return [item.label]
    }
    const custom = other.trim()
    return custom ? [custom] : []
  })
}

export const IDEAL_FOR_SUGGESTIONS = [
  'Couples',
  'Families',
  'Nature Lovers',
  'History Enthusiasts',
  'Wildlife Enthusiasts',
  'Adventure Seekers',
  'Culture Enthusiasts',
  'Beach Lovers',
  'Photography Enthusiasts',
  'Solo Travellers',
] as const

export function cleanOptionLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/** Comparison key that ignores capitalisation and surrounding or repeated spaces. */
export function optionKey(value: string): string {
  return cleanOptionLabel(value).toLowerCase()
}

export function uniqueOptionLabels(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const label = cleanOptionLabel(value)
    const key = optionKey(label)
    if (label && !seen.has(key)) {
      seen.add(key)
      result.push(label)
    }
  }
  return result
}

export const ESSENCE_THEMES = [
  { id: 'heritage-culture', label: 'Heritage & Culture', icon: 'account_balance' },
  { id: 'nature-scenery', label: 'Nature & Scenery', icon: 'landscape' },
  { id: 'local-life-traditions', label: 'Local Life & Traditions', icon: 'groups' },
  { id: 'adventure-discovery', label: 'Adventure & Discovery', icon: 'hiking' },
] as const

export type EssenceThemeId = (typeof ESSENCE_THEMES)[number]['id']

export function isEssenceThemeId(value: unknown): value is EssenceThemeId {
  return ESSENCE_THEMES.some((theme) => theme.id === value)
}

export function essenceThemeLabels(ids: string[]): string[] {
  return essenceThemesInSavedOrder(ids).map((theme) => theme.label)
}

/** Keeps the administrator's selection order and drops unknown or duplicate ids. */
export function essenceThemesInSavedOrder(ids: string[]): (typeof ESSENCE_THEMES)[number][] {
  const seen = new Set<string>()
  const result: (typeof ESSENCE_THEMES)[number][] = []
  for (const id of ids) {
    if (seen.has(id) || !isEssenceThemeId(id)) {
      continue
    }
    seen.add(id)
    const theme = ESSENCE_THEMES.find((item) => item.id === id)
    if (theme) {
      result.push(theme)
    }
  }
  return result
}

export const HIGHLIGHT_TITLE_SUGGESTIONS = [
  'Sunrise & Sunset',
  'Beaches & Coastal Views',
  'Waterfalls & Scenic Viewpoints',
  'Wildlife & National Parks',
  'Historical Landmarks',
  'Temples & Cultural Sites',
  'Tea Estates & Plantations',
  'Hiking & Adventure',
  'Local Experiences',
  'Notable Attractions',
] as const

export const DESTINATION_HIGHLIGHT_ICON_OPTIONS = [
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'sun', label: 'Sun' },
  { id: 'palm-tree', label: 'Palm tree' },
  { id: 'waves', label: 'Waves' },
  { id: 'droplets', label: 'Waterfall' },
  { id: 'sailboat', label: 'Boat' },
  { id: 'paw-print', label: 'Wildlife' },
  { id: 'bird', label: 'Birds' },
  { id: 'fish', label: 'Marine life' },
  { id: 'binoculars', label: 'Viewpoint' },
  { id: 'trees', label: 'Forest' },
  { id: 'leaf', label: 'Tea & plantations' },
  { id: 'flower', label: 'Gardens' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'footprints', label: 'Hiking' },
  { id: 'tent', label: 'Camping' },
  { id: 'landmark', label: 'Landmark' },
  { id: 'castle', label: 'Fortress' },
  { id: 'church', label: 'Place of worship' },
  { id: 'store', label: 'Local market' },
  { id: 'utensils', label: 'Local food' },
  { id: 'coffee', label: 'Tea & coffee' },
  { id: 'music', label: 'Music & dance' },
  { id: 'palette', label: 'Arts & crafts' },
  { id: 'train', label: 'Train journey' },
  { id: 'camera', label: 'Photography' },
  { id: 'map-pin', label: 'Notable place' },
  { id: 'compass', label: 'Discovery' },
  { id: 'star', label: 'Highlight' },
  { id: 'sparkles', label: 'Special experience' },
] as const

export type DestinationHighlightIconId = (typeof DESTINATION_HIGHLIGHT_ICON_OPTIONS)[number]['id']

export const DESTINATION_HIGHLIGHT_FALLBACK_ICON: DestinationHighlightIconId = 'sparkles'

export function isDestinationHighlightIconId(value: unknown): value is DestinationHighlightIconId {
  return DESTINATION_HIGHLIGHT_ICON_OPTIONS.some((option) => option.id === value)
}
