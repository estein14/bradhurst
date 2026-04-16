import { createTheme } from "@mui/material/styles";

/** Harlem map — warm neutrals with accent aligned to map pins */
const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#c86d04",
			dark: "#9a5203",
			light: "#e8a84a",
		},
		secondary: {
			main: "#2d4270",
			dark: "#1a2948",
			light: "#4a6194",
		},
		background: {
			default: "#f2f2e1",
			paper: "rgba(255, 255, 255, 0.92)",
		},
		text: {
			primary: "rgba(0, 0, 0, 0.87)",
			secondary: "rgba(0, 0, 0, 0.6)",
		},
	},
	shape: {
		borderRadius: 12,
	},
	typography: {
		fontFamily: [
			"system-ui",
			"-apple-system",
			"BlinkMacSystemFont",
			'"SF Pro Text"',
			'"SF Pro Display"',
			'"Segoe UI"',
			"sans-serif",
		].join(","),
		h6: {
			fontWeight: 600,
		},
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
	},
});

export default theme;
