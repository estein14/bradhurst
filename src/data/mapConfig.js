export const INITIAL = {
	center: { lat: 40.826, lng: -73.94 },
	zoom: 16,
	heading: 360,
	tilt: 0,
};

export const CUSTOM_STYLE = [
	{
		featureType: "all",
		elementType: "labels.text.fill",
		stylers: [{ color: "#1a3f70" }],
	},
	{
		featureType: "all",
		elementType: "labels.text.stroke",
		stylers: [{ color: "#f2f2e1" }],
	},
	{
		featureType: "water",
		elementType: "labels.text.fill",
		stylers: [{ color: "#ffffff" }],
	},
	{
		featureType: "landscape.man_made",
		elementType: "geometry.fill",
		stylers: [{ color: "#FFC37A" }],
	},
	{
		featureType: "landscape.natural",
		elementType: "geometry.fill",
		stylers: [{ color: "#43ab4a" }],
	},
	{
		featureType: "water",
		elementType: "geometry.fill",
		stylers: [{ color: "#2d4270" }],
	},
	{
		featureType: "poi",
		elementType: "geometry.stroke",
		stylers: [{ color: "#c3c7c3" }],
	},
	{
		featureType: "poi.business",
		elementType: "geometry.fill",
		stylers: [{ color: "#c3c7c3" }],
	},
	{
		featureType: "poi.park",
		elementType: "geometry.fill",
		stylers: [{ color: "#5cb564" }],
	},
	{
		featureType: "road",
		elementType: "geometry.fill",
		stylers: [{ color: "#fafffc" }],
	},
	{
		featureType: "road.local",
		elementType: "geometry.fill",
		stylers: [{ color: "#fafffc" }],
	},
	{
		featureType: "road.arterial",
		elementType: "geometry.fill",
		stylers: [{ color: "#fafffc" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry.fill",
		stylers: [{ color: "#fceecc" }],
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#c3c7c3" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry.stroke",
		stylers: [{ color: "#c3c7c3" }],
	},
	{
		featureType: "administrative",
		elementType: "geometry.stroke",
		stylers: [{ color: "#c3c7c3" }],
	},
];

export const HIDE_DEFAULT_PINS = [
	{
		featureType: "poi",
		elementType: "labels",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "poi",
		elementType: "labels.icon",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "poi",
		elementType: "labels.text",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "transit",
		elementType: "labels.icon",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "transit",
		elementType: "labels.text",
		stylers: [{ visibility: "off" }],
	},
];

export const PARK_LABELS = [
	{
		featureType: "poi.park",
		elementType: "labels.text.fill",
		stylers: [{ visibility: "on" }, { color: "#ffffff" }],
	},
	{
		featureType: "poi.park",
		elementType: "labels.text.stroke",
		stylers: [{ visibility: "on" }, { color: "#43ab4a" }],
	},
];

export const FIT_TO_MARKERS_ON_LOAD = true;

export const MAP_STYLES = [
	...HIDE_DEFAULT_PINS,
	...CUSTOM_STYLE,
	...PARK_LABELS,
];

export const DEFAULT_FALLBACK_IMAGE =
	"https://images.squarespace-cdn.com/content/v1/67f73c88fa874d611b62f3b9/51f93621-f3c9-4ae5-a81e-b74c6dbab952/Common+Good.png";
