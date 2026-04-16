import { CATEGORY_BY_NAME } from "./categoryByName";
import { LOCATIONS } from "./locationsRaw";

function applyCategories(list) {
	const out = list.map((loc) => ({
		...loc,
		category: loc.category || CATEGORY_BY_NAME[loc.name] || "services",
	}));
	return out;
}

/** All businesses with `category` set. */
export const locations = applyCategories(LOCATIONS);

export function getFilteredLocations(locationsList, query, category) {
	const q = (query || "").toLowerCase();
	return locationsList.filter((loc) => {
		const hay = `${loc.name || ""} ${loc.url || ""}`.toLowerCase();
		if (!hay.includes(q)) return false;
		if (!category || category === "all") return true;
		return (loc.category || "services") === category;
	});
}
