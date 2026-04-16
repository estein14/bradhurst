import { useCallback, useMemo, useState } from "react";
import { HarlemMap } from "./components/HarlemMap";
import { AccordionPanel } from "./components/AccordionPanel";
import {
	getFilteredLandmarks,
	landmarks,
} from "./data/landmarks";
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
	const filteredLandmarks = useMemo(
		() => getFilteredLandmarks(landmarks, searchQuery, category),
		[searchQuery, category],
	);

	const [focusLandmarkId, setFocusLandmarkId] = useState(
		/** @type {string | null} */ (null),
	);
	const [scrollIntoViewLandmarkId, setScrollIntoViewLandmarkId] = useState(
		/** @type {string | null} */ (null),
	);

	const onBusinessMarkerClick = useCallback((idx) => {
		setScrollIntoViewIdx(idx);
	}, []);

	const onLandmarkMarkerClick = useCallback((id) => {
		setScrollIntoViewLandmarkId(id);
	}, []);

	const onFocusConsumed = useCallback(() => {
		setFocusBusinessIndex(null);
	}, []);

	const onFocusLandmarkConsumed = useCallback(() => {
		setFocusLandmarkId(null);
	}, []);

	const onAccordionActivate = useCallback((idx) => {
		setFocusBusinessIndex(idx);
	}, []);

	const onSelectLandmark = useCallback((id) => {
		setFocusLandmarkId(id);
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
				filteredLandmarks={filteredLandmarks}
				allLocations={locations}
				onSelectLocation={onAccordionActivate}
				onSelectLandmark={onSelectLandmark}
				scrollIntoViewIdx={scrollIntoViewIdx}
				onScrollConsumed={() => setScrollIntoViewIdx(null)}
				scrollIntoViewLandmarkId={scrollIntoViewLandmarkId}
				onLandmarkScrollConsumed={() => setScrollIntoViewLandmarkId(null)}
			/>
			<HarlemMap
				locations={locations}
				filteredLocations={filteredLocations}
				focusBusinessIndex={focusBusinessIndex}
				onFocusConsumed={onFocusConsumed}
				onBusinessMarkerClick={onBusinessMarkerClick}
				focusLandmarkId={focusLandmarkId}
				onFocusLandmarkConsumed={onFocusLandmarkConsumed}
				onLandmarkMarkerClick={onLandmarkMarkerClick}
			/>
		</div>
	);
}

export default App;
