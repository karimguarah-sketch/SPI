import { Site } from '../types';

// 15 Spanish cities for Grohe España
const spanishCities = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza',
  'Málaga', 'Bilbao', 'Murcia', 'Palma de Mallorca', 'Las Palmas',
  'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón'
];

// French cities for other suppliers
const frenchCities = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux',
  'Lille', 'Nantes', 'Strasbourg', 'Nice', 'Montpellier',
  'Rennes', 'Reims', 'Toulon', 'Grenoble', 'Dijon',
  'Angers', 'Le Mans', 'Brest', 'Tours', 'Clermont-Ferrand',
  'Amiens', 'Limoges', 'Metz', 'Perpignan', 'Besançon',
  'Orléans', 'Rouen', 'Caen', 'Nancy', 'Avignon',
  'Poitiers', 'La Rochelle', 'Pau', 'Bayonne', 'Chambéry',
  'Troyes', 'Colmar', 'Charleville-Mézières', 'Vannes', 'Quimper',
  'Saint-Étienne', 'Le Havre', 'Dunkerque', 'Calais', 'Boulogne',
  'Ajaccio', 'Bastia', 'Mulhouse', 'Belfort', 'Auxerre'
];

// Generate stores (magasins)
export const stores: Site[] = [];

// Spanish stores (for Grohe)
spanishCities.forEach((city, i) => {
  stores.push({
    id: `store-es-${i + 1}`,
    name: `Magasin ${city}`,
    city,
    type: 'magasin',
  });
});

// French stores (150 stores total)
frenchCities.forEach((city, i) => {
  for (let j = 1; j <= 3; j++) {
    if (stores.length >= 165) break;
    stores.push({
      id: `store-fr-${i * 3 + j}`,
      name: `Magasin ${city}${j > 1 ? ` ${j}` : ''}`,
      city,
      type: 'magasin',
    });
  }
});

// Generate warehouses (entrepôts)
const warehouseCities = [
  'Madrid Centro Log.', 'Barcelona Log.', 'Valencia Log.', 'Sevilla Log.', 'Zaragoza Log.',
  'Paris Nord Log.', 'Lyon Est Log.', 'Marseille Sud Log.', 'Bordeaux Ouest Log.', 'Lille Nord Log.',
  'Toulouse Log.', 'Nantes Log.', 'Strasbourg Log.', 'Rennes Log.', 'Dijon Log.',
];

export const warehouses: Site[] = warehouseCities.map((city, i) => ({
  id: `wh-${i + 1}`,
  name: `Entrepôt ${city}`,
  city: city.replace(' Log.', ''),
  type: 'entrepot',
}));

export const allSites: Site[] = [...stores, ...warehouses];

export const spanishStoreIds = spanishCities.map((_, i) => `store-es-${i + 1}`);
export const frenchStoreIds = stores.filter(s => s.id.startsWith('store-fr-')).map(s => s.id);
export const warehouseIds = warehouses.map(w => w.id);
