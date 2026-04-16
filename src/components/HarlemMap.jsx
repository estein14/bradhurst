import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
	INITIAL,
	MAP_STYLES,
	FIT_TO_MARKERS_ON_LOAD,
	DEFAULT_FALLBACK_IMAGE,
} from "../data/mapConfig";
import { landmarks } from "../data/landmarks";
import { escapeHtml } from "../utils/htmlEscape";

const getPinIcon = (Point) => ({
	path: "M12 2C7.6 2 4 5.5 4 9.9c0 6 8 12.1 8 12.1s8-6.1 8-12.1C20 5.5 16.4 2 12 2z",
	fillColor: "#ff540a",
	fillOpacity: 1,
	strokeColor: "#ffffff",
	strokeOpacity: 1,
	strokeWeight: 3,
	scale: 1.6,
	anchor: new Point(12, 22),
});

const getLandmarkPinIcon = (Point) => ({
	path: "M12 2C7.6 2 4 5.5 4 9.9c0 6 8 12.1 8 12.1s8-6.1 8-12.1C20 5.5 16.4 2 12 2z",
	fillColor: "#1a3f70",
	fillOpacity: 1,
	strokeColor: "#ffffff",
	strokeOpacity: 1,
	strokeWeight: 3,
	scale: 1.75,
	anchor: new Point(12, 22),
});

function buildBusinessPopupHtml(loc) {
	const imageUrl = loc.image || DEFAULT_FALLBACK_IMAGE;
	const safeUrl = imageUrl.replace(/'/g, "\\'");
	const phoneHref = loc.phone
		? `tel:${loc.phone.replace(/[^0-9+]/g, "")}`
		: "";
	const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
	const popupWebsiteBtn = loc.url
		? `<a href="${loc.url}" target="_blank" rel="noopener" aria-label="Open website" style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.24);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(14px);color:#ffffff;border:1px solid rgba(255,255,255,0.25);border-radius:999px;padding:6px 10px;text-decoration:none;font-weight:700;z-index:1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H21V10"/><path d="M10 14L21 3"/><path d="M21 14V21H3V3H10"/></svg>
          </a>`
		: "";
	return `
        <div
          style="
            width: 380px;
			box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
          "
        >
          <div
            style="
              width: 100%;
              height: 240px;
              margin: 0;
              padding: 0;
              border-radius: 0;
              background-image: url('${safeUrl}');
              background-size: cover;
              background-position: center;
              position: relative;
            "
          >${popupWebsiteBtn}</div>
          <div
            style="
              margin: 0;
              padding: 28px 18px 18px 16px;
              background: rgba(255, 255, 255, 0.64);
              backdrop-filter: blur(14px);
              -webkit-backdrop-filter: blur(14px);
              border-radius: 0 0 8px 8px;
            "
          >
            ${
							loc.name
								? `<div style="font-weight:500; font-size:18px; margin-bottom:8px; color:#000000;">${loc.name}</div>`
								: ""
						}
            ${
							loc.address
								? `<div style="font-size:14px; text-decoration:underline; margin-bottom:7px; color:#000000;">${loc.address}</div>`
								: ""
						}
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-top:6px;">
            ${
							loc.phone
								? `<a href="${phoneHref}" style="font-size:14px; color:#000000; text-decoration:none;">${loc.phone}</a>`
								: ""
						}
            <a href="${directionsUrl}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:500; color:#c86d04; text-decoration:none;">Get Directions<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;flex-shrink:0" aria-hidden="true"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg></a>
            </div>
          </div>
        </div>`;
}

export function HarlemMap({
	locations,
	filteredLocations,
	focusBusinessIndex,
	onFocusConsumed,
	onBusinessMarkerClick,
}) {
	const [map, setMap] = useState(/** @type {google.maps.Map | null} */ (null));
	const markersRef = useRef(/** @type {google.maps.Marker[]} */ ([]));
	const clustererRef = useRef(/** @type {MarkerClusterer | null} */ (null));
	const landmarkMarkersRef = useRef(/** @type {google.maps.Marker[]} */ ([]));
	const infoRef = useRef(/** @type {google.maps.InfoWindow | null} */ (null));
	const didFitBounds = useRef(false);
	const clickListenerRef = useRef(/** @type {google.maps.MapsEventListener | null} */ (null));
	const locationsRef = useRef(locations);
	const onBizClickRef = useRef(onBusinessMarkerClick);
	locationsRef.current = locations;
	onBizClickRef.current = onBusinessMarkerClick;

	const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
	const { isLoaded, loadError } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: apiKey,
	});

	const onMapLoad = useCallback((m) => {
		infoRef.current = new window.google.maps.InfoWindow();
		setMap(m);
	}, []);

	const openBusinessAtIndex = useCallback((idx) => {
		const m = markersRef.current[idx];
		const info = infoRef.current;
		const mmap = map;
		if (!mmap || !info || !m) return;
		const loc = locationsRef.current[idx];
		if (!loc) return;
		info.setContent(buildBusinessPopupHtml(loc));
		info.open({ anchor: m, map: mmap });
		mmap.panTo(m.getPosition());
		onBizClickRef.current(idx);
	}, [map]);

	/* Business markers + clusterer */
	useEffect(() => {
		if (!map) return;
		const g = window.google.maps;
		const Point = g.Point;
		const businessPin = getPinIcon(Point);

		const markers = locations.map((loc, idx) => {
			const mk = new g.Marker({
				position: { lat: loc.lat, lng: loc.lng },
				title: loc.name,
				icon: businessPin,
				map,
			});
			mk.addListener("click", () => {
				openBusinessAtIndex(idx);
			});
			return mk;
		});
		markersRef.current = markers;

		const clusterer = new MarkerClusterer({ map, markers });
		clustererRef.current = clusterer;

		clickListenerRef.current = g.event.addListener(map, "click", () => {
			infoRef.current?.close();
		});

		return () => {
			if (clickListenerRef.current) {
				g.event.removeListener(clickListenerRef.current);
				clickListenerRef.current = null;
			}
			clusterer.clearMarkers();
			markers.forEach((mk) => mk.setMap(null));
			markersRef.current = [];
			clustererRef.current = null;
		};
	}, [map, locations, openBusinessAtIndex]);

	/* Filter → clusterer */
	useEffect(() => {
		const clusterer = clustererRef.current;
		if (!clusterer || !markersRef.current.length) return;
		const visibleIdx = new Set(
			filteredLocations.map((loc) => locations.indexOf(loc)),
		);
		const visibleMarkers = markersRef.current.filter((_, i) =>
			visibleIdx.has(i),
		);
		clusterer.clearMarkers();
		clusterer.addMarkers(visibleMarkers);
	}, [filteredLocations, locations]);

	/* Landmarks */
	useEffect(() => {
		if (!map) return;
		const g = window.google.maps;
		const Point = g.Point;
		const lmIcon = getLandmarkPinIcon(Point);
		const info = infoRef.current;

		const built = landmarks.map((lm) => {
			const m = new g.Marker({
				position: { lat: lm.lat, lng: lm.lng },
				title: lm.name,
				icon: lmIcon,
				map,
				zIndex: 1000,
			});
			m.addListener("click", () => {
				const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lm.lat},${lm.lng}`;
				const moreBlock = lm.learnMoreUrl
					? `<p style="margin:12px 0 0;"><a href="${lm.learnMoreUrl}" target="_blank" rel="noopener" style="color:#1a3f70;font-weight:600;">Learn more →</a></p>`
					: "";
				const html = `
        <div style="max-width:320px;padding:0;font-family:system-ui,sans-serif;">
          <div style="font-weight:600;font-size:17px;margin-bottom:6px;color:#000;">${escapeHtml(lm.name)}</div>
          ${
						lm.address
							? `<div style="font-size:13px;margin-bottom:8px;color:#333;">${escapeHtml(
									lm.address,
								)}</div>`
							: ""
					}
          <div style="font-size:14px;line-height:1.45;color:#222;">${escapeHtml(
						lm.description,
					)}</div>
          ${moreBlock}
          <p style="margin:12px 0 0;">
            <a href="${directionsUrl}" target="_blank" rel="noopener" style="color:#c86d04;font-weight:600;">Get Directions</a>
          </p>
        </div>`;
				info?.setContent(html);
				info?.open({ anchor: m, map });
				map.panTo(m.getPosition());
			});
			return m;
		});
		landmarkMarkersRef.current = built;
		return () => {
			built.forEach((m) => m.setMap(null));
			landmarkMarkersRef.current = [];
		};
	}, [map]);

	/* Accordion requested focus */
	useEffect(() => {
		if (focusBusinessIndex == null) return;
		openBusinessAtIndex(focusBusinessIndex);
		onFocusConsumed();
	}, [focusBusinessIndex, onFocusConsumed, openBusinessAtIndex]);

	/* Fit bounds once */
	useEffect(() => {
		if (!map || didFitBounds.current) return;
		if (!FIT_TO_MARKERS_ON_LOAD) return;
		const g = window.google.maps;
		const bounds = new g.LatLngBounds();
		locations.forEach((loc) =>
			bounds.extend({ lat: loc.lat, lng: loc.lng }),
		);
		landmarks.forEach((lm) => bounds.extend({ lat: lm.lat, lng: lm.lng }));
		map.fitBounds(bounds, 48);
		didFitBounds.current = true;
	}, [map, locations]);

	if (loadError) {
		return (
			<Box
				className="harlem-map-root map-error"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 2,
					boxSizing: "border-box",
					bgcolor: "background.default",
				}}
			>
				<Alert severity="error" variant="outlined">
					Map failed to load. Check your API key in <code>.env</code>.
				</Alert>
			</Box>
		);
	}

	if (!apiKey) {
		return (
			<Box
				className="harlem-map-root map-error"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 2,
					boxSizing: "border-box",
					bgcolor: "background.default",
				}}
			>
				<Alert severity="warning" variant="outlined">
					<Typography variant="body2" component="span">
						Set <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> in{" "}
						<code>.env</code>.
					</Typography>
				</Alert>
			</Box>
		);
	}

	if (!isLoaded) {
		return (
			<Box
				className="harlem-map-root map-loading"
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 2,
					boxSizing: "border-box",
					bgcolor: "background.default",
				}}
			>
				<CircularProgress color="primary" size={36} />
				<Typography variant="body2" color="text.secondary">
					Loading map…
				</Typography>
			</Box>
		);
	}

	return (
		<GoogleMap
			mapContainerClassName="harlem-map-root"
			center={INITIAL.center}
			zoom={INITIAL.zoom}
			heading={INITIAL.heading}
			tilt={INITIAL.tilt}
			options={{
				gestureHandling: "auto",
				fullscreenControl: true,
				streetViewControl: false,
				mapTypeControl: false,
				styles: MAP_STYLES,
			}}
			onLoad={onMapLoad}
		/>
	);
}
