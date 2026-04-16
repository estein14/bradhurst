const BASE = process.env.PUBLIC_URL || "";

/** Single map marker artwork for every landmark pin */
const LANDMARK_MAP_ICON = `${BASE}/nyc_building_map_icon.svg`;
const LANDMARK_MAP_ICON_SIZE = 70;

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   lat: number,
 *   lng: number,
 *   address?: string,
 *   description: string,
 *   learnMoreUrl?: string,
 *   learnMoreLabel?: string,
 *   phone?: string,
 *   image?: string,
 *   mapIconUrl?: string,
 *   mapIconSize?: number,
 * }} Landmark
 */

/** Parks & recreation — use custom map icons when set. */
export const landmarkParks = [
	{
		id: "jackie-robinson-park",
		name: "Jackie Robinson Park",
		lat: 40.82729085027376,
		lng: -73.94076119971355,
		address: "Bradhurst Ave & W 145th St, Harlem",
		description:
			"Named for baseball pioneer Jackie Robinson, this park is one of Harlem’s great green spaces—walking paths, recreation, and community life along historic stone walls and hillside trees.",
		learnMoreUrl:
			"https://www.nycgovparks.org/parks/jackie-robinson-park_manhattan/",
		phone: "+1 (212) 639-9675",
		image: `${BASE}/images/JRPark.jpg`,
		mapIconUrl: LANDMARK_MAP_ICON,
		mapIconSize: LANDMARK_MAP_ICON_SIZE,
	},
	{
		id: "holcombe-rucker-park",
		name: "Rucker Park",
		lat: 40.82929644283598,
		lng: -73.93611587453549,
		address: "W 155th St & Frederick Douglass Blvd",
		description:
			"Legendary outdoor court at the heart of Harlem streetball—where neighborhood runs and summer tournaments helped shape basketball culture worldwide.",
		learnMoreUrl: "https://www.nycgovparks.org/parks/holcombe-rucker-park",
		phone: "+1 (212) 639-9675",
		image: `${BASE}/images/Rucker.jpg`,
		mapIconUrl: LANDMARK_MAP_ICON,
		mapIconSize: LANDMARK_MAP_ICON_SIZE,
	},
];

/** Historical & cultural landmarks — distinct pins on the map. */
/** @type {Landmark[]} */
export const landmarks = [
	...landmarkParks,
	{
		id: "polo-ground-towers",
		name: "Polo Ground Towers",
		lat: 40.831249403609824,
		lng: -73.93780119814988,
		address: "2930 8th Ave, New York, NY 10039",
		description:
			"NYCHA housing on the historic site of the Polo Grounds ballpark, with views over the Harlem valley.",
		learnMoreUrl:
			"https://www.nyc.gov/assets/nycha/downloads/pdf/Polo%20Grounds%20Towers.pdf",
		learnMoreLabel: "NYCHA building information (PDF)",
		phone: "+1 (212) 283-1390",
		image: `${BASE}/images/poloGrounds.jpg`,
		mapIconUrl: LANDMARK_MAP_ICON,
		mapIconSize: LANDMARK_MAP_ICON_SIZE,
	},
	{
		id: "national-dance-institute",
		name: "The National Dance Institute",
		lat: 40.82392864651953,
		lng: -73.93976514452747,
		address: "217 W 147th St, New York, NY 10039",
		description:
			"Jacques d’Amboise Center for Learning & the Arts — inclusive dance education for children in NYC and teaching-artist training worldwide.",
		learnMoreUrl: "https://www.nationaldance.org/en",
		phone: "+1 (212) 226-0083",
		image: `${BASE}/images/DanceInstitute.webp`,
		mapIconUrl: LANDMARK_MAP_ICON,
		mapIconSize: LANDMARK_MAP_ICON_SIZE,
	},
	{
		id: "dunbar-apartments",
		name: "Dunbar Apartments",
		lat: 40.82523542311814,
		lng: -73.93806634232851,
		address: "226 W 150th St, New York, NY 10039",
		description:
			"National Register-listed (1926): Manhattan’s first large garden-apartment cooperative, with a U-shaped plan around a courtyard—financed by John D. Rockefeller, Jr., and home to many Harlem leaders and artists.",
		learnMoreUrl:
			"https://www.nps.gov/places/new-york-dunbar-apartments.htm",
		learnMoreLabel: "National Park Service",
		phone: "+1 (646) 973-5540",
		image: `${BASE}/images/Dunbar.jpg`,
		mapIconUrl: LANDMARK_MAP_ICON,
		mapIconSize: LANDMARK_MAP_ICON_SIZE,
	},
];

/**
 * Landmarks for the side panel:
 * - “Landmarks” or “All”: full list (search filters; empty query shows every landmark).
 * - Any other category: landmarks only when the search query matches (so they stay findable).
 * @param {Landmark[]} list
 * @param {string} query
 * @param {string} category
 */
export function getFilteredLandmarks(list, query, category) {
	const q = (query || "").toLowerCase().trim();
	const matchLandmark = (lm) => {
		const hay =
			`${lm.name || ""} ${lm.address || ""} ${lm.description || ""} ${lm.learnMoreLabel || ""} ${lm.learnMoreUrl || ""}`.toLowerCase();
		if (!q) return true;
		return hay.includes(q);
	};

	if (category === "landmarks" || category === "all") {
		return list.filter(matchLandmark);
	}
	if (q) {
		return list.filter(matchLandmark);
	}
	return [];
}
