/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CityData, MusicGenre } from "../types";

export const CITIES_DB: CityData[] = [
  {
    id: "bedroom",
    name: "Suburban Bedroom",
    country: "Everywhere",
    vibe: "Quiet, isolated, cheap, slightly gloomy",
    costToTravel: 0,
    genrePopularityBoosts: {
      [MusicGenre.AMBIENT]: 10,
      [MusicGenre.EXPERIMENTAL]: 15,
    },
    gigsUnlocked: true,
    prestigeNeeded: 0,
    description: "Your safe haven where you make music in your pajamas and get yelled at by your family or roommates to turn down the sub.",
    venues: [
      {
        name: "Twitch Livestream",
        capacity: 50,
        payout: 20,
        ticketPrice: 0,
        relevance: 0,
        tier: "underground",
      }
    ],
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    vibe: "Dark, fog machine smoke, heavy bass, industrial warehouses",
    costToTravel: 350,
    genrePopularityBoosts: {
      [MusicGenre.TECHNO]: 40,
      [MusicGenre.INDUSTRIAL]: 30,
      [MusicGenre.EXPERIMENTAL]: 20,
    },
    gigsUnlocked: false,
    prestigeNeeded: 5,
    description: "The Holy Grail of raw, dark underground techno. Legendary door policies, strict industrial design, and 72-hour weekend cycles.",
    venues: [
      {
        name: "Tresor-inspired Basement",
        capacity: 300,
        payout: 150,
        ticketPrice: 12,
        relevance: 5,
        tier: "underground",
      },
      {
        name: "Heizkraftwerk (Power Plant)",
        capacity: 1500,
        payout: 1200,
        ticketPrice: 22,
        relevance: 20,
        tier: "club",
      },
      {
        name: "Mauerpark open-air Festival",
        capacity: 8000,
        payout: 7500,
        ticketPrice: 45,
        relevance: 45,
        tier: "festival",
      }
    ],
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    vibe: "Grimey clubs, intense high speed drums, pirate radio nostalgia",
    costToTravel: 400,
    genrePopularityBoosts: {
      [MusicGenre.DRUM_AND_BASS]: 40,
      [MusicGenre.DUBSTEP]: 30,
      [MusicGenre.HOUSE]: 15,
    },
    gigsUnlocked: false,
    prestigeNeeded: 10,
    description: "Capital of jungle breaks, physical sub-bass systems, and underground garage networks. High energy, dark basements.",
    venues: [
      {
        name: "Brixton Archway",
        capacity: 250,
        payout: 180,
        ticketPrice: 15,
        relevance: 10,
        tier: "underground",
      },
      {
        name: "Fabricated Superclub",
        capacity: 2000,
        payout: 2500,
        ticketPrice: 25,
        relevance: 28,
        tier: "superclub",
      },
      {
        name: "Southwark Park DnB Weekender",
        capacity: 12000,
        payout: 14000,
        ticketPrice: 65,
        relevance: 60,
        tier: "festival",
      }
    ],
  },
  {
    id: "detroit",
    name: "Detroit",
    country: "United States",
    vibe: "Raw analog circuits, soulful high Tech jazz, gritty industrial charm",
    costToTravel: 800,
    genrePopularityBoosts: {
      [MusicGenre.TECHNO]: 35,
      [MusicGenre.HOUSE]: 25,
      [MusicGenre.INDUSTRIAL]: 15,
    },
    gigsUnlocked: false,
    prestigeNeeded: 15,
    description: "The birthplace of Techno. Soulful machines, gritty urban history, and deep mechanical grooves that influenced the world.",
    venues: [
      {
        name: "Packard Automotive Ruins",
        capacity: 400,
        payout: 300,
        ticketPrice: 15,
        relevance: 15,
        tier: "underground",
      },
      {
        name: "Woodward Avenue Venue",
        capacity: 1200,
        payout: 1800,
        ticketPrice: 20,
        relevance: 30,
        tier: "club",
      },
      {
        name: "Detroit Electronic Movement Festival",
        capacity: 25000,
        payout: 35000,
        ticketPrice: 85,
        relevance: 75,
        tier: "festival",
      }
    ],
  },
  {
    id: "ibiza",
    name: "Ibiza",
    country: "Spain",
    vibe: "Sunsets, luxurious terraces, deep open air bass, VIP sparkles",
    costToTravel: 600,
    genrePopularityBoosts: {
      [MusicGenre.HOUSE]: 40,
      [MusicGenre.TRANCE]: 30,
    },
    gigsUnlocked: false,
    prestigeNeeded: 22,
    description: "The global capital of dance music commercialism and luxury. Crystal clear outdoor sunbeds, mega-clubs, and top tier royalty structures.",
    venues: [
      {
        name: "San Antonio Beach Cafe",
        capacity: 500,
        payout: 400,
        ticketPrice: 20,
        relevance: 22,
        tier: "club",
      },
      {
        name: "Amnesic Dome",
        capacity: 5000,
        payout: 8000,
        ticketPrice: 55,
        relevance: 40,
        tier: "superclub",
      },
      {
        name: "Ush-Plaza Day Raver",
        capacity: 10000,
        payout: 18000,
        ticketPrice: 90,
        relevance: 65,
        tier: "festival",
      }
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    vibe: "Neon alleys, supreme audiophile hi-fi setups, glitch aesthetics",
    costToTravel: 1100,
    genrePopularityBoosts: {
      [MusicGenre.EXPERIMENTAL]: 35,
      [MusicGenre.SYNTHWAVE]: 30,
      [MusicGenre.HARDSTYLE]: 25,
    },
    gigsUnlocked: false,
    prestigeNeeded: 25,
    description: "Neon cyber-corridors featuring pristine high-fidelity custom sound systems, sound art galleries, and hyper-subgenres.",
    venues: [
      {
        name: "Shimokitazawa Audiophile Lounge",
        capacity: 150,
        payout: 250,
        ticketPrice: 18,
        relevance: 12,
        tier: "underground",
      },
      {
        name: "Shibuya Sound Castle",
        capacity: 2200,
        payout: 3500,
        ticketPrice: 35,
        relevance: 35,
        tier: "superclub",
      }
    ],
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    vibe: "Euphoric crowds, giant warehouses, high production lighting rigs",
    costToTravel: 300,
    genrePopularityBoosts: {
      [MusicGenre.TRANCE]: 35,
      [MusicGenre.HARDSTYLE]: 35,
      [MusicGenre.HOUSE]: 20,
    },
    gigsUnlocked: false,
    prestigeNeeded: 18,
    description: "Center of massive electronic world gatherings. Perfect laser grids, world-class staging, and unmatched euphoric crowds.",
    venues: [
      {
        name: "Canal House Social",
        capacity: 350,
        payout: 300,
        ticketPrice: 15,
        relevance: 18,
        tier: "underground",
      },
      {
        name: "Paradiso Auditorium",
        capacity: 1800,
        payout: 2800,
        ticketPrice: 30,
        relevance: 32,
        tier: "club",
      },
      {
        name: "Amsterdam Arena Mega-Rave",
        capacity: 40000,
        payout: 65000,
        ticketPrice: 105,
        relevance: 80,
        tier: "festival",
      }
    ],
  },
  {
    id: "los_angeles",
    name: "Los Angeles",
    country: "United States",
    vibe: "Hollywood neon, sunset driving synths, heavy bass drops",
    costToTravel: 1000,
    genrePopularityBoosts: {
      [MusicGenre.SYNTHWAVE]: 40,
      [MusicGenre.DUBSTEP]: 30,
      [MusicGenre.HOUSE]: 20,
    },
    gigsUnlocked: false,
    prestigeNeeded: 30,
    description: "The city of silver screen sync deals, pool parties, driving outrun grids, and massive bass stages near the ocean.",
    venues: [
      {
        name: "Warehouse DTLA Rave",
        capacity: 600,
        payout: 700,
        ticketPrice: 20,
        relevance: 25,
        tier: "underground",
      },
      {
        name: "Hollywood Palladium Live",
        capacity: 4000,
        payout: 9000,
        ticketPrice: 45,
        relevance: 48,
        tier: "superclub",
      },
      {
        name: "Coachella Valley Headliner",
        capacity: 75000,
        payout: 140000,
        ticketPrice: 180,
        relevance: 88,
        tier: "festival",
      }
    ],
  }
];
export const travelToCityCost = (cityId: string): number => {
  const city = CITIES_DB.find(c => c.id === cityId);
  return city ? city.costToTravel : 0;
};
