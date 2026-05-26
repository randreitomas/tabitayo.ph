import type { Event } from '@/types/event'
import type { Guest } from '@/types/guest'
import type { HostAccount, User } from '@/types/user'
import type { PhotoShareItem } from '@/types/event'

export const MOCK_HOST: User = {
  id: 'host-1',
  email: 'maria@example.com',
  role: 'host',
  displayName: 'Maria Santos',
}

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@tabitayo.ph',
  role: 'admin',
  displayName: 'Tabitayo Admin',
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-demo',
    hostId: 'host-1',
    name: 'Santos–Reyes Wedding',
    date: '2026-06-14',
    venue: 'Manila Cathedral & Sofitel',
    tier: 'premium',
    status: 'active',
    floorPlanUrl:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b8?w=800&q=80',
    menuContent:
      '**Amuse-bouche**\nEnsaladang talong with crispy shallots\n\n**Main**\nBeef caldereta · Grilled salmon · Vegetable lasagna\n\n**Dessert**\nSans rival · Ube leche flan',
    spotifyUrl:
      'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator',
    photoShareEnabled: true,
    customBranding: { primaryColor: '#e8c4b8', logoUrl: '' },
  },
  {
    id: 'evt-ended',
    hostId: 'host-1',
    name: 'Debut of Ana Cruz',
    date: '2025-12-20',
    venue: 'The Peninsula Manila',
    tier: 'standard',
    status: 'ended',
    photoShareEnabled: false,
  },
  {
    id: 'evt-2',
    hostId: 'host-2',
    name: 'Acme Corp Year-End Gala',
    date: '2026-11-30',
    venue: 'Shangri-La BGC',
    tier: 'premium',
    status: 'active',
    photoShareEnabled: true,
    customBranding: { primaryColor: '#e8c97a', logoUrl: '' },
  },
]

export const MOCK_GUESTS: Guest[] = [
  {
    id: 'g1',
    eventId: 'evt-demo',
    fullName: 'Juan Dela Cruz',
    alias: 'Johnny',
    tableNumber: '12',
    seatNumber: '3',
  },
  {
    id: 'g2',
    eventId: 'evt-demo',
    fullName: 'Maria Clara Santos',
    alias: 'Claire',
    tableNumber: '5',
    seatNumber: '1',
  },
  {
    id: 'g3',
    eventId: 'evt-demo',
    fullName: 'Ana Lourdes Reyes-Garcia',
    tableNumber: '8',
    seatNumber: '2',
  },
  {
    id: 'g4',
    eventId: 'evt-demo',
    fullName: 'Jose Rizal Mercado',
    alias: 'Pepe',
    tableNumber: '12',
    seatNumber: '4',
  },
  {
    id: 'g5',
    eventId: 'evt-demo',
    fullName: 'Ma. Elena Villanueva',
    alias: 'Elen',
    tableNumber: '3',
    seatNumber: '6',
  },
  {
    id: 'g6',
    eventId: 'evt-demo',
    fullName: 'Carlos Antonio Lopez',
    tableNumber: '12',
    seatNumber: '1',
  },
  {
    id: 'g7',
    eventId: 'evt-demo',
    fullName: 'Patricia Mae Fernandez',
    alias: 'Tricia',
    tableNumber: '5',
    seatNumber: '4',
  },
  {
    id: 'g8',
    eventId: 'evt-demo',
    fullName: 'Roberto Santos Jr.',
    tableNumber: '8',
    seatNumber: '5',
  },
]

export const MOCK_HOSTS: HostAccount[] = [
  {
    id: MOCK_HOST.id,
    email: MOCK_HOST.email,
    role: 'host',
    displayName: MOCK_HOST.displayName,
    status: 'approved',
    eventCount: 2,
    createdAt: '2025-08-01',
  },
  {
    id: 'host-2',
    email: 'events@acme.ph',
    role: 'host',
    displayName: 'Acme Events Team',
    status: 'approved',
    eventCount: 1,
    createdAt: '2025-10-15',
  },
  {
    id: 'host-3',
    email: 'newhost@example.com',
    role: 'host',
    displayName: 'New Organizer',
    status: 'pending',
    eventCount: 0,
    createdAt: '2026-05-20',
  },
]

export const MOCK_PHOTOS: PhotoShareItem[] = [
  {
    id: 'ph1',
    eventId: 'evt-demo',
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    caption: 'Beautiful ceremony!',
    status: 'approved',
    uploadedAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'ph2',
    eventId: 'evt-demo',
    imageUrl:
      'https://images.unsplash.com/photo-1464366400600-7168b8d9d35f?w=400&q=80',
    status: 'approved',
    uploadedAt: '2026-06-14T11:30:00Z',
  },
  {
    id: 'ph3',
    eventId: 'evt-demo',
    imageUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    caption: 'Dance floor vibes',
    status: 'pending',
    uploadedAt: '2026-06-14T12:00:00Z',
  },
]
