import heroDusk from '../assets/images/hero-dusk.png'
import entranceNight from '../assets/images/entrance-night.png'
import interior from '../assets/images/interior.jpg'

export type GalleryItem = {
  id: string
  src: string
  alt: string
  category: 'Ambience' | 'Food' | 'Events/Nights'
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    src: heroDusk,
    alt: 'Highway 10 Food Court at dusk with illuminated signage, Jamnagar',
    category: 'Ambience',
  },
  {
    id: 'g2',
    src: entranceNight,
    alt: 'Night entrance to Highway 10 with glowing HIGHWAY 10 letters',
    category: 'Events/Nights',
  },
  {
    id: 'g3',
    src: interior,
    alt: 'Colourful indoor seating and pendant lights at Highway 10 food court',
    category: 'Ambience',
  },
  {
    id: 'g4',
    src: heroDusk,
    alt: 'Outdoor pathway and lit terrace at Highway 10, evening sky',
    category: 'Events/Nights',
  },
  {
    id: 'g5',
    src: interior,
    alt: 'Multi-brand food counters and dining hall inside Highway 10',
    category: 'Food',
  },
  {
    id: 'g6',
    src: entranceNight,
    alt: 'Festive lit archway and outdoor seating at Highway 10 night',
    category: 'Events/Nights',
  },
]

export { heroDusk, entranceNight, interior }
