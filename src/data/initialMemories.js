export const INITIAL_MEMORIES = [
  {
    id: 'mem-1',
    title: 'Primeros pasos en el jardín de casa',
    description: 'Hoy nuestra pequeña Sofia dio sus primeros 5 pasos solita hacia nosotros con una sonrisa inolvidable. ¡Un momento lleno de aplausos, lágrimas de emoción y amor puro!',
    imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    date: '2026-06-15',
    category: 'Primeros Pasos',
    tags: ['primeros-pasos', 'jardin', 'hsofia', 'felicidad', 'amor'],
    author: {
      name: 'Papá (Alex)',
      email: 'alex@familia.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    },
    likes: ['mama@familia.com'],
    comments: [
      {
        id: 'c1',
        authorName: 'Mamá',
        authorEmail: 'mama@familia.com',
        text: '¡Casi lloro de la emoción! Qué rápido está creciendo nuestra princesa Sofia ❤️',
        date: '2026-06-15T14:30:00Z'
      }
    ],
    createdAt: new Date('2026-06-15').toISOString()
  },
  {
    id: 'mem-2',
    title: 'Tarde de helado de fresa y risas',
    description: 'Disfrutando de un domingo soleado. Sofia terminó con helado de fresa en toda la carita y nos contagió su carcajada.',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-20',
    category: 'Travesuras',
    tags: ['helado', 'domingo', 'hsofia', 'sonrisas'],
    author: {
      name: 'Mamá',
      email: 'mama@familia.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mama'
    },
    likes: ['alex@familia.com'],
    comments: [
      {
        id: 'c2',
        authorName: 'Papá (Alex)',
        authorEmail: 'alex@familia.com',
        text: 'La foto favorita del mes. Tenemos que enmarcarla en su cuarto 🍦✨',
        date: '2026-07-20T18:10:00Z'
      }
    ],
    createdAt: new Date('2026-07-20').toISOString()
  },
  {
    id: 'mem-3',
    title: 'Celebrando el cumpleaños de Sofia',
    description: 'Su pastel lleno de estrellas y globos rosas. Ver sus ojitos brillar al soplar la velita nos llenó el corazón de gratitud.',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    date: '2026-08-05',
    category: 'Cumpleaños',
    tags: ['cumpleaños', 'fiesta', 'estrellas', 'familia', 'hsofia'],
    author: {
      name: 'Papá (Alex)',
      email: 'alex@familia.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    },
    likes: ['mama@familia.com', 'alex@familia.com'],
    comments: [
      {
        id: 'c3',
        authorName: 'Mamá',
        authorEmail: 'mama@familia.com',
        text: 'El día más hermoso del año. Te amamos con el alma, Sofia hermosa ❤️🎂',
        date: '2026-08-05T20:00:00Z'
      }
    ],
    createdAt: new Date('2026-08-05').toISOString()
  },
  {
    id: 'mem-4',
    title: 'Primeras olas en la playa',
    description: 'Nuestras vacaciones en la costa. Tocó las olas con timidez y luego no quería salir de la arena.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    date: '2026-08-14',
    category: 'Viajes',
    tags: ['playa', 'vacaciones', 'mar', 'arena', 'hsofia'],
    author: {
      name: 'Mamá',
      email: 'mama@familia.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mama'
    },
    likes: ['alex@familia.com'],
    comments: [],
    createdAt: new Date('2026-08-14').toISOString()
  },
  {
    id: 'mem-5',
    title: 'Leyendo su cuento favorito antes de dormir',
    description: 'Cada noche señala a los animalitos en el libro y hace sus sonidos. Un ritual de paz y ternura infinita.',
    imageUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80',
    date: '2026-08-18',
    category: 'Momentos Especiales',
    tags: ['cuentos', 'noche', 'ternura', 'paz', 'hsofia'],
    author: {
      name: 'Papá (Alex)',
      email: 'alex@familia.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    },
    likes: ['mama@familia.com'],
    comments: [],
    createdAt: new Date('2026-08-18').toISOString()
  }
];

export const CATEGORIES = [
  'Todas',
  'Momentos Especiales',
  'Primeros Pasos',
  'Cumpleaños',
  'Viajes',
  'Sonrisas',
  'Travesuras',
  'Familia'
];

