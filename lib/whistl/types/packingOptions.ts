export interface BoxType {
  id: string; // Unique ID
  name: string; // Human readable name
  length: number; // cm
  width: number; // cm
  height: number; // cm
}

export const DefaultBoxTypes: BoxType[] = [
  {
    id: 'box1',
    name: 'Box 1',
    length: 28.0,
    width: 20.0,
    height: 12.0,
  },
  {
    id: 'box2',
    name: 'Box 2',
    length: 28.0,
    width: 20.0,
    height: 22.0,
  },
  {
    id: 'box3',
    name: 'Box 3',
    length: 28.0,
    width: 20.0,
    height: 32.0,
  },
  {
    id: 'box4',
    name: 'Box 4',
    length: 37.0,
    width: 29.0,
    height: 22.0,
  },
  {
    id: 'box5',
    name: 'Box 5',
    length: 37.0,
    width: 29.0,
    height: 32.0,
  },
  {
    id: 'smallEnvelope',
    name: 'Small Envelope',
    length: 24.0,
    width: 17.0,
    height: 7.0,
  },
  {
    id: 'largeEnvelope',
    name: 'Large Envelope',
    length: 29.5,
    width: 23.0,
    height: 7.0,
  },
];
