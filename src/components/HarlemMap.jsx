import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
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
	fillColor: "#6aa5ff",
	fillOpacity: 1,
	strokeColor: "#ffffff",
	strokeOpacity: 1,
	strokeWeight: 3,
	scale: 1.45,
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
								? `<div style="font-size:14px; margin-bottom:7px; color:#000000;">${loc.address}</div>`
								: ""
						}
            <div style="display:flex; align-items:center; gap:12px; margin-top:6px; width:100%; min-width:0;">
            <span style="flex:1; min-width:0;">${
							loc.phone
								? `<a href="${phoneHref}" style="font-size:14px; color:#000000; text-decoration:none;">${loc.phone}</a>`
								: ""
						}</span>
            <a href="${directionsUrl}" target="_blank" rel="noopener" aria-label="Get directions" style="display:inline-flex; align-items:center; color:#c86d04; text-decoration:none; flex-shrink:0; margin-left:auto;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:28px;height:28px;flex-shrink:0" aria-hidden="true"><path d="m17.17 11-1.59 1.59L17 14l4-4-4-4-1.41 1.41L17.17 9H9c-1.1 0-2 .9-2 2v9h2v-9z"/></svg></a>
            </div>
          </div>
        </div>`;
}

/** @param {*} lm */
function buildLandmarkPopupHtml(lm) {
	const scale = lm.popupScale ?? 1;
	const width = Math.round(380 * scale);
	const heroH = lm.image ? Math.round(240 * scale) : 0;
	const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lm.lat},${lm.lng}`;
	const phoneHref = lm.phone
		? `tel:${lm.phone.replace(/[^0-9+]/g, "")}`
		: "";
	const safeImg = lm.image ? lm.image.replace(/'/g, "\\'") : "";
	const pad = `${Math.round(28 * scale)}px ${Math.round(18 * scale)}px ${Math.round(18 * scale)}px ${Math.round(16 * scale)}px`;
	const titleSize = Math.round(18 * scale);
	const bodySize = Math.round(14 * scale);
	const mbAddr = Math.round(7 * scale);
	const mtRow = Math.round(6 * scale);
	const gap = Math.round(12 * scale);
	const dirIconSize = Math.round(28 * scale);
	const linkText = lm.learnMoreLabel || lm.learnMoreUrl;
	/** Same pattern as business popups: link on the hero when there’s a photo; otherwise a single line in the panel. */
	const landmarkWebsiteBtn =
		lm.image && lm.learnMoreUrl
			? `<a href="${lm.learnMoreUrl}" target="_blank" rel="noopener" aria-label="Open website" style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.24);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(14px);color:#ffffff;border:1px solid rgba(255,255,255,0.25);border-radius:999px;padding:6px 10px;text-decoration:none;font-weight:700;z-index:1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H21V10"/><path d="M10 14L21 3"/><path d="M21 14V21H3V3H10"/></svg>
          </a>`
			: "";
	const showMoreLinkInBody = Boolean(lm.learnMoreUrl && !lm.image);
	const moreBlock = showMoreLinkInBody
		? `<div style="font-size:${bodySize}px;margin-top:${Math.round(8 * scale)}px;margin-bottom:${Math.round(7 * scale)}px;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><a href="${lm.learnMoreUrl}" target="_blank" rel="noopener" title="${escapeHtml(lm.learnMoreUrl)}" style="color:#000000;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(linkText)}</a></div>`
		: "";
	const phoneBlock = lm.phone
		? `<a href="${phoneHref}" style="font-size:${bodySize}px;color:#000000;text-decoration:none;">${escapeHtml(
				lm.phone,
			)}</a>`
		: "";
	const imageSection = lm.image
		? `<div style="width:100%;height:${heroH}px;background-image:url('${safeImg}');background-size:cover;background-position:center;position:relative;">${landmarkWebsiteBtn}</div>`
		: "";
	return `
        <div
          style="
            width: ${width}px;
            max-width: 95vw;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
          "
        >
          ${imageSection}
          <div
            style="
              margin: 0;
              padding: ${pad};
              background: rgba(255, 255, 255, 0.64);
              backdrop-filter: blur(14px);
              -webkit-backdrop-filter: blur(14px);
              border-radius: ${lm.image ? "0 0 8px 8px" : "8px"};
            "
          >
            ${
							lm.name
								? `<div style="font-weight:500; font-size:${titleSize}px; margin-bottom:${Math.round(8 * scale)}px; color:#000000;">${escapeHtml(lm.name)}</div>`
								: ""
						}
            ${
							lm.address
								? `<div style="font-size:${bodySize}px; margin-bottom:${mbAddr}px; color:#000000;">${escapeHtml(
										lm.address,
									)}</div>`
								: ""
						}
            ${moreBlock}
            <div style="display:flex; align-items:center; gap:${gap}; margin-top:${mtRow}; width:100%; min-width:0;">
              <span style="flex:1; min-width:0;">${phoneBlock}</span>
              <a href="${directionsUrl}" target="_blank" rel="noopener" aria-label="Get directions" style="display:inline-flex; align-items:center; color:#c86d04; text-decoration:none; flex-shrink:0; margin-left:auto;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:${dirIconSize}px;height:${dirIconSize}px;flex-shrink:0" aria-hidden="true"><path d="m17.17 11-1.59 1.59L17 14l4-4-4-4-1.41 1.41L17.17 9H9c-1.1 0-2 .9-2 2v9h2v-9z"/></svg></a>
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
	focusLandmarkId,
	onFocusLandmarkConsumed,
	onLandmarkMarkerClick,
}) {
	const [map, setMap] = useState(/** @type {google.maps.Map | null} */ (null));
	const markersRef = useRef(/** @type {google.maps.Marker[]} */ ([]));
	const landmarkMarkersRef = useRef(/** @type {google.maps.Marker[]} */ ([]));
	const infoRef = useRef(/** @type {google.maps.InfoWindow | null} */ (null));
	const didFitBounds = useRef(false);
	const clickListenerRef = useRef(/** @type {google.maps.MapsEventListener | null} */ (null));
	const locationsRef = useRef(locations);
	const onBizClickRef = useRef(onBusinessMarkerClick);
	const onLandmarkClickRef = useRef(onLandmarkMarkerClick);
	locationsRef.current = locations;
	onBizClickRef.current = onBusinessMarkerClick;
	onLandmarkClickRef.current = onLandmarkMarkerClick;

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

	/* Business markers (each pin stays separate at all zoom levels) */
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

		clickListenerRef.current = g.event.addListener(map, "click", () => {
			infoRef.current?.close();
		});

		return () => {
			if (clickListenerRef.current) {
				g.event.removeListener(clickListenerRef.current);
				clickListenerRef.current = null;
			}
			markers.forEach((mk) => mk.setMap(null));
			markersRef.current = [];
		};
	}, [map, locations, openBusinessAtIndex]);

	/* Filter → show/hide markers */
	useEffect(() => {
		if (!map || !markersRef.current.length) return;
		const visibleIdx = new Set(
			filteredLocations.map((loc) => locations.indexOf(loc)),
		);
		markersRef.current.forEach((mk, i) => {
			mk.setMap(visibleIdx.has(i) ? map : null);
		});
	}, [map, filteredLocations, locations]);

	const openLandmarkById = useCallback(
		(id) => {
			const idx = landmarks.findIndex((l) => l.id === id);
			const m = landmarkMarkersRef.current[idx];
			const info = infoRef.current;
			const mmap = map;
			const lm = landmarks[idx];
			if (!mmap || !info || !m || !lm) return;
			info.setContent(buildLandmarkPopupHtml(lm));
			info.open({ anchor: m, map: mmap });
			mmap.panTo(m.getPosition());
		},
		[map],
	);

	/* Landmarks */
	useEffect(() => {
		if (!map) return;
		const g = window.google.maps;
		const Point = g.Point;
		const defaultLmIcon = getLandmarkPinIcon(Point);
		const info = infoRef.current;

		const built = landmarks.map((lm) => {
			let icon = defaultLmIcon;
			if (lm.mapIconUrl) {
				const s = lm.mapIconSize ?? 52;
				icon = {
					url: lm.mapIconUrl,
					scaledSize: new g.Size(s, s),
					anchor: new g.Point(s / 2, s),
				};
			}
			const m = new g.Marker({
				position: { lat: lm.lat, lng: lm.lng },
				title: lm.name,
				icon,
				map,
				zIndex: lm.mapIconUrl ? 1100 : 1000,
			});
			m.addListener("click", () => {
				info?.setContent(buildLandmarkPopupHtml(lm));
				info?.open({ anchor: m, map });
				map.panTo(m.getPosition());
				onLandmarkClickRef.current?.(lm.id);
			});
			return m;
		});
		landmarkMarkersRef.current = built;
		return () => {
			built.forEach((marker) => marker.setMap(null));
			landmarkMarkersRef.current = [];
		};
	}, [map]);

	/* Accordion requested focus */
	useEffect(() => {
		if (focusBusinessIndex == null) return;
		openBusinessAtIndex(focusBusinessIndex);
		onFocusConsumed();
	}, [focusBusinessIndex, onFocusConsumed, openBusinessAtIndex]);

	/* Accordion requested landmark focus */
	useEffect(() => {
		if (focusLandmarkId == null) return;
		openLandmarkById(focusLandmarkId);
		onFocusLandmarkConsumed();
	}, [focusLandmarkId, onFocusLandmarkConsumed, openLandmarkById]);

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
