import { useCallback, useMemo, useState } from "react";
import { HarlemMap } from "./components/HarlemMap";
import { AccordionPanel } from "./components/AccordionPanel";
import { locations, getFilteredLocations } from "./data/locations";
import "./styles/App.css";

function useEmbedMode() {
	return useMemo(() => {
		if (typeof window === "undefined") return false;
		return new URLSearchParams(window.location.search).get("embed") === "1";
	}, []);
}

function App() {
	const embed = useEmbedMode();
	const [searchQuery, setSearchQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [focusBusinessIndex, setFocusBusinessIndex] = useState(
		/** @type {number | null} */ (null),
	);
	const [scrollIntoViewIdx, setScrollIntoViewIdx] = useState(
		/** @type {number | null} */ (null),
	);

	const filteredLocations = useMemo(
		() => getFilteredLocations(locations, searchQuery, category),
		[searchQuery, category],
	);

	const onBusinessMarkerClick = useCallback((idx) => {
		setScrollIntoViewIdx(idx);
	}, []);

	const onFocusConsumed = useCallback(() => {
		setFocusBusinessIndex(null);
	}, []);

	const onAccordionActivate = useCallback((idx) => {
		setFocusBusinessIndex(idx);
	}, []);

	return (
		<div
			className={`app-layout${embed ? " app-layout--embed" : ""}`}
		>
			<AccordionPanel
				embed={embed}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				category={category}
				onCategoryChange={setCategory}
				filteredLocations={filteredLocations}
				allLocations={locations}
				onSelectLocation={onAccordionActivate}
				scrollIntoViewIdx={scrollIntoViewIdx}
				onScrollConsumed={() => setScrollIntoViewIdx(null)}
			/>
			<HarlemMap
				locations={locations}
				filteredLocations={filteredLocations}
				focusBusinessIndex={focusBusinessIndex}
				onFocusConsumed={onFocusConsumed}
				onBusinessMarkerClick={onBusinessMarkerClick}
			/>
		</div>
	);
}

export default App;
