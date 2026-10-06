import type {
  CatalogDestination,
  DestinationExperience,
  DestinationInfoItem,
  DestinationPlace,
  DestinationSeason,
} from '@/types/destinations.ts'

const placeholderExperiences: DestinationExperience[] = [
  {
    title: '[Experience title]',
    description: '[Experience description from Figma]',
    imageAlt: '[Experience image]',
    category: '[Category]',
    duration: '[Duration]',
  },
  {
    title: '[Experience title]',
    description: '[Experience description from Figma]',
    imageAlt: '[Experience image]',
    category: '[Category]',
    duration: '[Duration]',
  },
]

const placeholderPlaces: DestinationPlace[] = [
  {
    name: '[Place name]',
    label: '[Place label]',
    description: '[Place description from Figma]',
    imageAlt: '[Place image]',
  },
]

const placeholderWhy: DestinationInfoItem[] = [
  { title: '[Why-visit title]', body: '[Why-visit detail from Figma]' },
]

const placeholderSeasons: DestinationSeason[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
].map((month) => ({ month, status: 'note' as const }))

const placeholderTravelInfo: DestinationInfoItem[] = [
  { title: '[Travel note title]', body: '[Travel note from Figma]' },
  { title: '[Travel note title]', body: '[Travel note from Figma]' },
]

function baseDestination(
  partial: Omit<CatalogDestination, 'highlights' | 'places' | 'facts' | 'stats' | 'whyVisit' | 'seasons' | 'travelInfo' | 'published'> &
    Partial<Pick<CatalogDestination, 'highlights' | 'places' | 'facts' | 'stats' | 'whyVisit' | 'seasons' | 'travelInfo' | 'published'>>,
): CatalogDestination {
  return {
    highlights: placeholderExperiences,
    places: placeholderPlaces,
    facts: [
      { label: '[Fact label]', value: '[Fact]', icon: 'schedule' },
      { label: '[Fact label]', value: '[Fact]', icon: 'thermostat' },
      { label: '[Fact label]', value: '[Fact]', icon: 'place' },
      { label: '[Fact label]', value: '[Fact]', icon: 'directions_car' },
    ],
    stats: [
      { value: '[Stat]', label: '[Stat label]', note: '[Stat note]' },
    ],
    whyVisit: placeholderWhy,
    seasons: placeholderSeasons,
    travelInfo: placeholderTravelInfo,
    published: true,
    ...partial,
  }
}

export const mockDestinations: CatalogDestination[] = [
  baseDestination({
    id: 'sigiriya',
    slug: 'sigiriya-cultural-triangle',
    name: 'Sigiriya & Cultural Triangle',
    region: 'Northern Central Plains',
    kicker: '[UNESCO World Heritage]',
    tagline: 'Ancient Palaces in the Sky, Whispering Cave Monasteries & Royal Sacred Forests',
    shortDescription:
      'Ascend the 5th-century fortress citadel rising above emerald canopy, wander ancient water gardens, and discover sacred cave monasteries filled with millennia-old frescoes. A transcendent junction of ancient sovereign engineering and spiritual grandeur.',
    fullDescription:
      'In the late 5th century, King Kashyapa transformed this colossal solitary granite monolith into an opulent royal sanctuary and defensive citadel. Crowned by a 1.6-hectare sky palace complete with terraced royal gardens, cisterns carved straight from bedrock, and the colossal brickwork paws of a mythical lion that once guarded the final stairwell.\n\nBeneath the monolith lies one of the oldest planned landscape complexes in human history. Here, sophisticated symmetry combines landscaped boulder formations, sunken terraced pavilions, and precision gravity-fed hydraulic fountains that still spray cool water after seasonal monsoon showers today.\n\nHalfway up the sheer western rock face sheltered within a natural rock gallery rest the celebrated Sigiriya Frescoes—sensual, celestial maidens painted in natural tempera pigments that have retained their radiant ochres, terracottas, and verdant hues for over 1,500 uninterrupted years.',
    overviewTitle: 'A Fortress in the Clouds Built Upon Vision & Mastery',
    images: [
      { alt: 'Sigiriya Lion Rock sunrise view over misty jungle canopy' },
      { alt: 'Sigiriya water gardens' },
      { alt: 'Dambulla cave temples' },
      { alt: 'Polonnaruwa stone palaces' },
    ],
    tags: ['[Tag]', '[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    featured: true,
    featuredSize: 'large',
    gridCols: 7,
    facts: [
      { label: '[Hero fact]', value: '[Value]', icon: 'schedule' },
      { label: '[Hero fact]', value: '[Value]', icon: 'thermostat' },
      { label: '[Hero fact]', value: '[Value]', icon: 'place' },
      { label: '[Hero fact]', value: '[Value]', icon: 'directions_car' },
    ],
    stats: [
      { value: '1,200', label: 'Carved Steps', note: 'From ground gardens to palace summit' },
      { value: '1,500', label: 'Years Preserved', note: 'Continuous antiquity & hydraulic canals' },
      { value: '3', label: 'National Parks', note: 'Minneriya, Kaudulla & Eco-corridors' },
    ],
    whyVisit: [
      { title: 'Dawn 06:30 Priority Ascent', body: '[Detail from Figma]' },
      { title: 'Private Certified Archaeologist', body: '[Detail from Figma]' },
      { title: 'Base Camp Refreshment', body: '[Detail from Figma]' },
      { title: 'Dedicated Executive Transport', body: '[Detail from Figma]' },
    ],
    highlights: [
      {
        title: 'Dawn Ascent of Sigiriya Lion Rock',
        description:
          'Beat the midday heat and climbing lines. Ascend through the water gardens and past the mirror wall as golden light illuminates the ancient royal ruins.',
        imageAlt: 'Dawn ascent of Sigiriya',
        category: '[Category]',
        duration: '[Duration]',
      },
      {
        title: 'Sunset Hike Up Pidurangala Rock',
        description:
          'A scenic nature scramble directly facing the Sigiriya monolith. Revel in an uninterrupted 360-degree panorama as dusk blankets the surrounding central forests.',
        imageAlt: 'Pidurangala sunset',
        category: '[Category]',
        duration: '[Duration]',
      },
      {
        title: 'Minneriya & Kaudulla Elephant Gathering',
        description:
          'Private 4x4 open safari jeep excursion to observe wild Asian elephant herds converging around ancient seasonal reservoirs in their natural habitat.',
        imageAlt: 'Minneriya elephant gathering',
        category: '[Category]',
        duration: '[Duration]',
      },
      {
        title: 'Habarana Rural Farm & Catamaran Trail',
        description:
          'Drift along water lily lakes on a twin-hulled wooden boat, visit an organic farmstead, and savor traditional curries simmered in clay pots over wood fires.',
        imageAlt: 'Habarana catamaran trail',
        category: '[Category]',
        duration: '[Duration]',
      },
      {
        title: 'Hot Air Ballooning Over Ancient Canopies',
        description:
          'Drift noiselessly at sunrise over pristine water reserves, Sigiriya monolith, and wild elephant corridors, culminating in a celebratory champagne toast.',
        imageAlt: 'Hot air balloon over Sigiriya',
        category: '[Category]',
        duration: '[Duration]',
      },
      {
        title: 'Cycling Polonnaruwa Ancient Citadel',
        description:
          'Glide on classic cruiser bicycles along tree-shaded pathways connecting 12th-century stone palaces, Gal Vihara master sculptures, and sacred lotus ponds.',
        imageAlt: 'Cycling Polonnaruwa',
        category: '[Category]',
        duration: '[Duration]',
      },
    ],
    placesTitle: 'Sacred Highlights of the Cultural Triangle',
    placesIntro:
      'Sigiriya is the ideal central base. Within easy scenic driving distance lie world-renowned ancient capitals and hidden forest sanctuaries.',
    places: [
      {
        name: 'Dambulla Royal Cave Temple',
        label: 'UNESCO Heritage Site',
        description: '[Place description from Figma]',
        imageAlt: 'Dambulla Royal Cave Temple',
      },
      {
        name: 'Ancient Polonnaruwa',
        label: 'Medieval Royal Capital',
        description: '[Place description from Figma]',
        imageAlt: 'Ancient Polonnaruwa',
      },
      {
        name: 'Sacred Anuradhapura',
        label: 'Oldest Chronicle Capital',
        description: '[Place description from Figma]',
        imageAlt: 'Sacred Anuradhapura',
      },
      {
        name: 'Ritigala Nature Reserve',
        label: 'Mystic Forest Hermitage',
        description: '[Place description from Figma]',
        imageAlt: 'Ritigala Nature Reserve',
      },
    ],
  }),
  baseDestination({
    id: 'nuwara-eliya',
    slug: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    region: 'Central Highlands',
    kicker: '[Tea Country]',
    shortDescription:
      'High-elevation colonial sanctuaries amidst cool mountain air, manicured tea gardens, cascading waterfalls, and world-class single-estate Ceylon tea tastings inside heritage factories.',
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Highland tea plantations and mountain mist' }],
    tags: ['[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 5,
  }),
  baseDestination({
    id: 'ella',
    slug: 'ella',
    name: 'Ella & The Peaks',
    region: 'Highland Peaks',
    kicker: '[Scenic Rail]',
    shortDescription:
      'Charming mountain retreat framed by dramatic rock escarpments, pine-scented hiking trails, and the world-famous blue train journey across colonial stone viaducts.',
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Nine Arch Bridge blue train in Ella' }],
    tags: ['[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 5,
  }),
  baseDestination({
    id: 'yala-minneriya',
    slug: 'wildlife-safari-sanctuaries',
    name: 'Wildlife & Safari Sanctuaries',
    region: 'Yala, Wilpattu & Minneriya',
    kicker: '[National Parks]',
    shortDescription:
      "Roam untamed scrublands harboring the world's highest leopard density, vast gatherings of wild Asian elephants, and over 400 species of vibrant tropical avifauna in open-top custom 4x4 vehicles.",
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Elephant family marching near lake water at scenic Sri Lankan national park' }],
    tags: ['[Tag]', '[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    featured: true,
    featuredSize: 'large',
    gridCols: 7,
  }),
  baseDestination({
    id: 'galle-coast',
    slug: 'galle-fort-southern-coast',
    name: 'Galle Fort & Southern Coast',
    region: 'Southern Province',
    kicker: '[UNESCO Fort]',
    shortDescription:
      'Stroll cobblestone ramparts where 17th-century Dutch colonial architecture meets crashing Indian Ocean waves, artisan boutiques, and golden sunset viewpoints.',
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Scenic palm-fringed southern coastal road' }],
    tags: ['[Tag]', '[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 6,
  }),
  baseDestination({
    id: 'mirissa-tangalle',
    slug: 'mirissa-tangalle-beaches',
    name: 'Mirissa & Tangalle Beaches',
    region: 'Deep South',
    kicker: '[Coast]',
    shortDescription:
      'Uncrowded palm-fringed sands, private catamaran blue whale expeditions, tranquil secluded coves, and oceanfront villa dining under swaying coconut palms.',
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Serene golden beach with leaning palms and outrigger boats' }],
    tags: ['[Tag]', '[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 6,
  }),
  baseDestination({
    id: 'kandy',
    slug: 'kandy-sacred-kingdom',
    name: 'Kandy & Sacred Kingdom',
    region: 'Central Province',
    kicker: '[Sacred City]',
    shortDescription:
      "Sri Lanka's last royal stronghold, cradled around a tranquil lake and home to the sacred Temple of the Tooth Relic, lush Peradeniya botanical gardens, and ceremonial Kandyan dance rituals.",
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Kandy lake and Temple of the Tooth' }],
    tags: ['[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 6,
  }),
  baseDestination({
    id: 'colombo',
    slug: 'colombo-west-coast',
    name: 'Colombo & West Coast',
    region: 'Western Province',
    kicker: '[Gateway City]',
    shortDescription:
      'A dynamic fusion of colonial landmark hotels, bustling pettah bazaar arcades, world-class contemporary seafood dining, and tranquil coastal promenade sunsets overlooking the Laccadive Sea.',
    fullDescription: '[Full destination overview from Figma]',
    images: [{ alt: 'Colombo west coast promenade' }],
    tags: ['[Tag]', '[Tag]', '[Tag]'],
    stayNote: '[Stay note from Figma]',
    gridCols: 6,
  }),
  baseDestination({
    id: 'dest-unpublished',
    slug: 'unpublished-destination',
    name: '[Unpublished destination]',
    shortDescription: '[MOCK] Unpublished destination must not appear on the public listing.',
    fullDescription: '[MOCK] Unpublished destination.',
    images: [{ alt: '[Unpublished image]' }],
    tags: [],
    published: false,
  }),
]
