/** @typedef {{ id: string, name: string, lat: number, lng: number, address?: string, description: string, learnMoreUrl?: string }} Landmark */

/** Historical & cultural landmarks — distinct pins on the map. */
/** @type {Landmark[]} */
export const landmarks = [
	{
		id: "jackie-robinson-park",
		name: "Jackie Robinson Park",
		lat: 40.82667,
		lng: -73.94111,
		address: "Bradhurst Ave & W 145th St, Harlem",
		description:
			"Named for baseball pioneer Jackie Robinson, this park has served Harlem for generations. Fill in historical detail here.",
		learnMoreUrl: "https://www.nycgovparks.org/parks/jackie-robinson-park",
	},
	{
		id: "polo-grounds",
		name: "Polo Grounds (historic)",
		lat: 40.8319,
		lng: -73.9379,
		address: "Area of Coogan’s Bluff / Edgecombe Ave & 155th St",
		description:
			"Home of the New York Giants and later the Mets until demolition in 1964. Add your narrative here.",
		learnMoreUrl: "https://en.wikipedia.org/wiki/Polo_Grounds",
	},
	{
		id: "holcombe-rucker-park",
		name: "Holcombe Rucker Park",
		lat: 40.8293,
		lng: -73.9355,
		address: "W 155th St & Frederick Douglass Blvd",
		description:
			"Legendary streetball venue at the heart of basketball culture. Add your copy here.",
		learnMoreUrl: "https://www.nycgovparks.org/parks/holcombe-rucker-park",
	},
	{
		id: "national-dance-institute",
		name: "National Dance Institute",
		lat: 40.82,
		lng: -73.9409,
		address: "217 W 147th St, New York, NY 10039",
		description:
			"Jacques d’Amboise Center for Learning & the Arts — dance education for children. Add details here.",
		learnMoreUrl: "https://www.nationaldance.org/",
	},
	{
		id: "dunbar-apartments",
		name: "Dunbar Apartments",
		lat: 40.8245,
		lng: -73.9434,
		address: "288 W 149th St, New York, NY 10039",
		description:
			"A landmark Paul Laurence Dunbar–named housing complex with architectural and cultural significance. Add your research here.",
		learnMoreUrl:
			"https://en.wikipedia.org/wiki/Dunbar_Apartment_Buildings",
	},
];
