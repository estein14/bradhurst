import { useEffect, useRef, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

const FALLBACK_IMG =
	"https://images.squarespace-cdn.com/content/v1/67f73c88fa874d611b62f3b9/51f93621-f3c9-4ae5-a81e-b74c6dbab952/Common+Good.png";

/** Website row: own line, single line with ellipsis (full URL in native tooltip). */
const panelWebsiteLinkSx = {
	display: "block",
	width: "100%",
	minWidth: 0,
	mt: 0.5,
	mb: 0.75,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	textDecoration: "none",
	"&:hover": { textDecoration: "none" },
};

/** One radius everywhere in this panel (px) — matches theme.shape.borderRadius */
const RX = 12;

const CATEGORIES = [
	{ value: "all", label: "All" },
	{ value: "food-drink", label: "Food & Drink" },
	{ value: "groceries", label: "Groceries" },
	{ value: "convenience", label: "Convenience" },
	{ value: "clothing", label: "Clothing" },
	{ value: "salon-barbershop", label: "Salon / Barbershop" },
	{ value: "services", label: "Services & more" },
	{ value: "landmarks", label: "Landmarks" },
];

const neutralOutlineSx = (embed) => ({
	flex: 1,
	minWidth: 0,
	"& .MuiOutlinedInput-root": {
		borderRadius: `${RX}px`,
		minHeight: 36,
		bgcolor: embed ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.72)",
		"&:hover .MuiOutlinedInput-notchedOutline": {
			borderColor: "grey.500",
		},
		"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
			borderColor: "grey.600",
			borderWidth: 1,
		},
	},
	"& .MuiOutlinedInput-notchedOutline": {
		borderColor: "grey.400",
	},
});

const viewModeIconSx = {
	flexShrink: 0,
	color: "grey.700",
	bgcolor: "transparent",
	borderRadius: `${RX}px`,
	"&:hover": {
		bgcolor: "rgba(0,0,0,0.07)",
	},
};

function EmptyState() {
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			spacing={1.5}
			sx={{ py: 5, px: 1, textAlign: "center", color: "text.secondary" }}
		>
			<SearchOffIcon sx={{ fontSize: 48, opacity: 0.55 }} aria-hidden />
			<Typography variant="body1" fontWeight={500}>
				No results
			</Typography>
			<Typography variant="body2" color="text.secondary">
				Try another search or category.
			</Typography>
		</Stack>
	);
}

export function AccordionPanel({
	searchQuery,
	onSearchChange,
	category,
	onCategoryChange,
	filteredLocations,
	filteredLandmarks,
	allLocations,
	onSelectLocation,
	onSelectLandmark,
	scrollIntoViewIdx,
	onScrollConsumed,
	scrollIntoViewLandmarkId,
	onLandmarkScrollConsumed,
	embed,
}) {
	const [namesOnly, setNamesOnly] = useState(false);
	const isNarrowScreen = useMediaQuery("(max-width:800px)");
	const resultsRef = useRef(/** @type {HTMLDivElement | null} */ (null));
	const itemRefs = useRef(/** @type {(HTMLDivElement | null)[]} */ ([]));
	const landmarkItemRefs = useRef(
		/** @type {Record<string, HTMLDivElement | null>} */ ({}),
	);

	const showLandmarksOnly = category === "landmarks";
	const showAllMixed = category === "all";
	/** Businesses + landmarks (same layout as “All”), including when a narrower category search matches a landmark. */
	const showMixedLandmarksPanel =
		showAllMixed ||
		(!showLandmarksOnly && filteredLandmarks.length > 0);

	const scrollToIndex = (globalIdx) => {
		const el = itemRefs.current[globalIdx];
		const resultsEl = resultsRef.current;
		if (!el || !resultsEl) return;
		const targetTop = el.offsetTop - resultsEl.offsetTop;
		const targetCenter =
			targetTop -
			resultsEl.clientHeight / 2 +
			el.offsetHeight / 2;
		resultsEl.scrollTo({ top: targetCenter, behavior: "smooth" });
	};

	useEffect(() => {
		if (scrollIntoViewIdx == null) return;
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				scrollToIndex(scrollIntoViewIdx);
				onScrollConsumed();
			});
		});
		return () => cancelAnimationFrame(id);
	}, [scrollIntoViewIdx, onScrollConsumed]);

	useEffect(() => {
		if (scrollIntoViewLandmarkId == null) return;
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const el = landmarkItemRefs.current[scrollIntoViewLandmarkId];
				const resultsEl = resultsRef.current;
				if (!el || !resultsEl) {
					onLandmarkScrollConsumed();
					return;
				}
				const targetTop = el.offsetTop - resultsEl.offsetTop;
				const targetCenter =
					targetTop -
					resultsEl.clientHeight / 2 +
					el.offsetHeight / 2;
				resultsEl.scrollTo({ top: targetCenter, behavior: "smooth" });
				onLandmarkScrollConsumed();
			});
		});
		return () => cancelAnimationFrame(id);
	}, [scrollIntoViewLandmarkId, onLandmarkScrollConsumed]);

	const panelEmbedSx = embed
		? {
				bgcolor: "rgba(45, 66, 112, 0.82)",
				borderRight: "2px solid #2d4270",
			}
		: {};

	const panelClass =
		`accordion-panel` +
		(isNarrowScreen ? " mobile-overlay-open" : "") +
		(namesOnly ? " accordion-panel--compact" : "");

	const listIsEmpty = showLandmarksOnly
		? filteredLandmarks.length === 0
		: showMixedLandmarksPanel
			? filteredLocations.length === 0 && filteredLandmarks.length === 0
			: filteredLocations.length === 0;

	const filledInputSx = (t) => ({
		color: t.palette.text.primary,
		bgcolor: embed
			? "rgba(255,255,255,0.9)"
			: "rgba(255,255,255,0.72)",
		px: 1,
		py: 0.5,
		minHeight: 34,
		borderRadius: `${RX}px`,
		"& input": {
			py: 0.5,
			fontSize: "0.8125rem",
		},
		"& input::placeholder": {
			color: t.palette.text.secondary,
			opacity: 1,
		},
	});

	return (
		<Box
			className={panelClass}
			aria-label="Locations"
			sx={{
				...panelEmbedSx,
				minHeight: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "stretch",
			}}
		>
			<Paper
				elevation={0}
				className="ac-panel-unified"
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					minHeight: 0,
					overflow: "hidden",
					borderRadius: `${RX}px`,
					/* Frosted glass — match legacy floating panel */
					bgcolor: embed
						? "rgba(255, 255, 255, 0.72)"
						: "rgba(255, 255, 255, 0.64)",
					backdropFilter: "blur(14px)",
					WebkitBackdropFilter: "blur(14px)",
					border: 1,
					borderColor: "rgba(255, 255, 255, 0.45)",
					boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
				}}
			>
				<Stack
					spacing={1.25}
					sx={{
						flex: 1,
						minHeight: 0,
						p: 1.5,
						pt: 1.5,
						pb: 1.25,
					}}
				>
					<TextField
						fullWidth
						variant="filled"
						hiddenLabel
						size="small"
						placeholder="Search Harlem"
						aria-label="Search locations"
						type="search"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						sx={{
							"& .MuiFilledInput-root": {
								borderRadius: `${RX}px`,
								overflow: "hidden",
							},
						}}
						slotProps={{
							input: {
								"aria-label": "Search locations",
								disableUnderline: true,
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon
											fontSize="small"
											sx={{ color: "grey.600", ml: 0.25 }}
										/>
									</InputAdornment>
								),
								sx: filledInputSx,
							},
						}}
					/>

					<Stack direction="row" spacing={1} alignItems="center">
						<TextField
							select
							fullWidth
							size="small"
							id="acCategory"
							label="Category"
							value={category}
							aria-label="Filter by category"
							onChange={(e) => onCategoryChange(e.target.value)}
							slotProps={{
								inputLabel: { shrink: true },
							}}
							sx={neutralOutlineSx(embed)}
						>
							{CATEGORIES.map((opt) => (
								<MenuItem key={opt.value} value={opt.value}>
									{opt.label}
								</MenuItem>
							))}
						</TextField>
						<Tooltip
							title={
								namesOnly
									? "Show full details"
									: "Names only"
							}
						>
							<IconButton
								type="button"
								size="small"
								aria-pressed={namesOnly}
								aria-label={
									namesOnly
										? "Show full details"
										: "Names only list"
								}
								onClick={() => setNamesOnly((v) => !v)}
								sx={viewModeIconSx}
							>
								{namesOnly ? (
									<ViewModuleIcon fontSize="small" />
								) : (
									<ViewListIcon fontSize="small" />
								)}
							</IconButton>
						</Tooltip>
					</Stack>

					<Box
						ref={resultsRef}
						className="ac-results"
						sx={{
							flex: 1,
							minHeight: 0,
							overflow: "auto",
							px: 0,
							pt: 0.25,
							pb: 0,
							scrollbarWidth: "thin",
						}}
					>
						{listIsEmpty ? (
							<EmptyState />
						) : showLandmarksOnly && namesOnly ? (
							<List dense disablePadding id="acList">
								{filteredLandmarks.map((lm) => (
									<Box
										key={lm.id}
										ref={(el) => {
											landmarkItemRefs.current[lm.id] = el;
										}}
										sx={{
											scrollMarginTop: 1,
											"&:last-child": { mb: 0.5 },
										}}
									>
										<ListItemButton
											dense
											onClick={() => onSelectLandmark(lm.id)}
											sx={{
												borderRadius: `${RX}px`,
												py: 0.75,
												alignItems: "flex-start",
												color: "text.primary",
												"&:hover": {
													bgcolor: "rgba(0,0,0,0.06)",
												},
											}}
										>
											<ListItemText
												primary={lm.name}
												primaryTypographyProps={{
													variant: "body2",
													sx: {
														fontWeight: 500,
														lineHeight: 1.35,
													},
												}}
											/>
										</ListItemButton>
									</Box>
								))}
							</List>
						) : showLandmarksOnly ? (
							<Stack spacing={1.5} component="div" id="acList">
								{filteredLandmarks.map((lm) => {
									const phoneHref = lm.phone
										? `tel:${lm.phone.replace(/[^0-9+]/g, "")}`
										: "";
									const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lm.lat},${lm.lng}`;
									const hasUrl = Boolean(lm.learnMoreUrl);
									const img = lm.image || FALLBACK_IMG;

									return (
										<Box
											key={lm.id}
											ref={(el) => {
												landmarkItemRefs.current[lm.id] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 1 },
											}}
										>
											<Card
												variant="outlined"
												sx={{
													borderRadius: `${RX}px`,
													overflow: "hidden",
													borderColor: "grey.400",
													"&:hover": {
														borderColor: "grey.600",
														boxShadow: 1,
													},
												}}
											>
												<Box
													onClick={() => onSelectLandmark(lm.id)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															onSelectLandmark(lm.id);
														}
													}}
													role="button"
													tabIndex={0}
													sx={{
														cursor: "pointer",
														"&:focus-visible": {
															outline: "2px solid",
															outlineColor: "grey.500",
															outlineOffset: 2,
															borderRadius: `${RX}px`,
														},
													}}
												>
													<CardMedia
														component="div"
														sx={{
															height: 200,
															backgroundImage: `url('${img.replace(/'/g, "\\'")}')`,
															backgroundSize: "cover",
															backgroundPosition: "top center",
														}}
													/>
													<CardContent sx={{ pt: 1.5, pb: 2, px: 2, minWidth: 0 }}>
														<Typography
															variant="subtitle1"
															component="h2"
															gutterBottom
														>
															{lm.name}
														</Typography>
														{lm.address ? (
															<Typography
																variant="caption"
																display="block"
																sx={{
																	mb: 0.75,
																	opacity: 0.95,
																}}
															>
																{lm.address}
															</Typography>
														) : null}
														{hasUrl ? (
															<Link
																href={lm.learnMoreUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="caption"
																display="block"
																title={lm.learnMoreUrl}
																sx={panelWebsiteLinkSx}
																onClick={(e) => e.stopPropagation()}
															>
																{lm.learnMoreLabel || lm.learnMoreUrl}
															</Link>
														) : null}
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																width: "100%",
																mt: hasUrl ? 0 : 0.5,
																gap: 1,
																minWidth: 0,
															}}
														>
															<Box sx={{ minWidth: 0, flex: 1 }}>
																{lm.phone ? (
																	<Link
																		href={phoneHref}
																		variant="body2"
																		color="text.primary"
																		underline="none"
																		onClick={(e) => e.stopPropagation()}
																	>
																		{lm.phone}
																	</Link>
																) : null}
															</Box>
															<Link
																href={directionsUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="body2"
																fontWeight={600}
																color="text.secondary"
																aria-label="Get directions"
																underline="none"
																onClick={(e) => e.stopPropagation()}
																sx={{
																	display: "inline-flex",
																	alignItems: "center",
																	ml: "auto",
																	flexShrink: 0,
																}}
															>
																<TurnRightIcon
																	sx={{ fontSize: 28 }}
																	aria-hidden
																/>
															</Link>
														</Box>
													</CardContent>
												</Box>
											</Card>
										</Box>
									);
								})}
							</Stack>
						) : showMixedLandmarksPanel && namesOnly ? (
							<List dense disablePadding id="acList">
								{filteredLocations.map((loc) => {
									const idx = allLocations.indexOf(loc);
									return (
										<Box
											key={`${loc.name}-${idx}`}
											ref={(el) => {
												itemRefs.current[idx] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 0.5 },
											}}
										>
											<ListItemButton
												dense
												onClick={() => onSelectLocation(idx)}
												sx={{
													borderRadius: `${RX}px`,
													py: 0.75,
													alignItems: "flex-start",
													color: "text.primary",
													"&:hover": {
														bgcolor: "rgba(0,0,0,0.06)",
													},
												}}
											>
												<ListItemText
													primary={loc.name}
													primaryTypographyProps={{
														variant: "body2",
														sx: {
															fontWeight: 500,
															lineHeight: 1.35,
														},
													}}
												/>
											</ListItemButton>
										</Box>
									);
								})}
								{filteredLandmarks.map((lm) => (
									<Box
										key={lm.id}
										ref={(el) => {
											landmarkItemRefs.current[lm.id] = el;
										}}
										sx={{
											scrollMarginTop: 1,
											"&:last-child": { mb: 0.5 },
										}}
									>
										<ListItemButton
											dense
											onClick={() => onSelectLandmark(lm.id)}
											sx={{
												borderRadius: `${RX}px`,
												py: 0.75,
												alignItems: "flex-start",
												color: "text.primary",
												"&:hover": {
													bgcolor: "rgba(0,0,0,0.06)",
												},
											}}
										>
											<ListItemText
												primary={lm.name}
												primaryTypographyProps={{
													variant: "body2",
													sx: {
														fontWeight: 500,
														lineHeight: 1.35,
													},
												}}
											/>
										</ListItemButton>
									</Box>
								))}
							</List>
						) : showMixedLandmarksPanel ? (
							<Stack spacing={1.5} component="div" id="acList">
								{filteredLocations.map((loc) => {
									const idx = allLocations.indexOf(loc);
									const hasUrl = Boolean(loc.url);
									const phoneHref = loc.phone
										? `tel:${loc.phone.replace(/[^0-9+]/g, "")}`
										: "";
									const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
									const img = loc.image || FALLBACK_IMG;

									return (
										<Box
											key={`${loc.name}-${idx}`}
											ref={(el) => {
												itemRefs.current[idx] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 1 },
											}}
										>
											<Card
												variant="outlined"
												sx={{
													borderRadius: `${RX}px`,
													overflow: "hidden",
													borderColor: "grey.400",
													"&:hover": {
														borderColor: "grey.600",
														boxShadow: 1,
													},
												}}
											>
												<Box
													onClick={() => onSelectLocation(idx)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															onSelectLocation(idx);
														}
													}}
													role="button"
													tabIndex={0}
													sx={{
														cursor: "pointer",
														"&:focus-visible": {
															outline: "2px solid",
															outlineColor: "grey.500",
															outlineOffset: 2,
															borderRadius: `${RX}px`,
														},
													}}
												>
													<CardMedia
														component="div"
														sx={{
															height: 200,
															backgroundImage: `url('${img.replace(/'/g, "\\'")}')`,
															backgroundSize: "cover",
															backgroundPosition: "top center",
														}}
													/>
													<CardContent sx={{ pt: 1.5, pb: 2, px: 2, minWidth: 0 }}>
														<Typography
															variant="subtitle1"
															component="h2"
															gutterBottom
														>
															{loc.name}
														</Typography>
														{loc.address ? (
															<Typography
																variant="caption"
																display="block"
																sx={{
																	mb: 0.75,
																	opacity: 0.95,
																}}
															>
																{loc.address}
															</Typography>
														) : null}
														{hasUrl ? (
															<Link
																href={loc.url}
																target="_blank"
																rel="noopener noreferrer"
																variant="caption"
																display="block"
																title={loc.url}
																sx={panelWebsiteLinkSx}
																onClick={(e) => e.stopPropagation()}
															>
																{loc.url}
															</Link>
														) : null}
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																width: "100%",
																mt: hasUrl ? 0 : 0.5,
																gap: 1,
																minWidth: 0,
															}}
														>
															<Box sx={{ minWidth: 0, flex: 1 }}>
																{loc.phone ? (
																	<Link
																		href={phoneHref}
																		variant="body2"
																		color="text.primary"
																		underline="none"
																		onClick={(e) => e.stopPropagation()}
																	>
																		{loc.phone}
																	</Link>
																) : null}
															</Box>
															<Link
																href={directionsUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="body2"
																fontWeight={600}
																color="text.secondary"
																aria-label="Get directions"
																underline="none"
																onClick={(e) => e.stopPropagation()}
																sx={{
																	display: "inline-flex",
																	alignItems: "center",
																	ml: "auto",
																	flexShrink: 0,
																}}
															>
																<TurnRightIcon
																	sx={{ fontSize: 28 }}
																	aria-hidden
																/>
															</Link>
														</Box>
													</CardContent>
												</Box>
											</Card>
										</Box>
									);
								})}
								{filteredLandmarks.map((lm) => {
									const phoneHref = lm.phone
										? `tel:${lm.phone.replace(/[^0-9+]/g, "")}`
										: "";
									const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lm.lat},${lm.lng}`;
									const hasUrl = Boolean(lm.learnMoreUrl);
									const img = lm.image || FALLBACK_IMG;

									return (
										<Box
											key={lm.id}
											ref={(el) => {
												landmarkItemRefs.current[lm.id] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 1 },
											}}
										>
											<Card
												variant="outlined"
												sx={{
													borderRadius: `${RX}px`,
													overflow: "hidden",
													borderColor: "grey.400",
													"&:hover": {
														borderColor: "grey.600",
														boxShadow: 1,
													},
												}}
											>
												<Box
													onClick={() => onSelectLandmark(lm.id)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															onSelectLandmark(lm.id);
														}
													}}
													role="button"
													tabIndex={0}
													sx={{
														cursor: "pointer",
														"&:focus-visible": {
															outline: "2px solid",
															outlineColor: "grey.500",
															outlineOffset: 2,
															borderRadius: `${RX}px`,
														},
													}}
												>
													<CardMedia
														component="div"
														sx={{
															height: 200,
															backgroundImage: `url('${img.replace(/'/g, "\\'")}')`,
															backgroundSize: "cover",
															backgroundPosition: "top center",
														}}
													/>
													<CardContent sx={{ pt: 1.5, pb: 2, px: 2, minWidth: 0 }}>
														<Typography
															variant="subtitle1"
															component="h2"
															gutterBottom
														>
															{lm.name}
														</Typography>
														{lm.address ? (
															<Typography
																variant="caption"
																display="block"
																sx={{
																	mb: 0.75,
																	opacity: 0.95,
																}}
															>
																{lm.address}
															</Typography>
														) : null}
														{hasUrl ? (
															<Link
																href={lm.learnMoreUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="caption"
																display="block"
																title={lm.learnMoreUrl}
																sx={panelWebsiteLinkSx}
																onClick={(e) => e.stopPropagation()}
															>
																{lm.learnMoreLabel || lm.learnMoreUrl}
															</Link>
														) : null}
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																width: "100%",
																mt: hasUrl ? 0 : 0.5,
																gap: 1,
																minWidth: 0,
															}}
														>
															<Box sx={{ minWidth: 0, flex: 1 }}>
																{lm.phone ? (
																	<Link
																		href={phoneHref}
																		variant="body2"
																		color="text.primary"
																		underline="none"
																		onClick={(e) => e.stopPropagation()}
																	>
																		{lm.phone}
																	</Link>
																) : null}
															</Box>
															<Link
																href={directionsUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="body2"
																fontWeight={600}
																color="text.secondary"
																aria-label="Get directions"
																underline="none"
																onClick={(e) => e.stopPropagation()}
																sx={{
																	display: "inline-flex",
																	alignItems: "center",
																	ml: "auto",
																	flexShrink: 0,
																}}
															>
																<TurnRightIcon
																	sx={{ fontSize: 28 }}
																	aria-hidden
																/>
															</Link>
														</Box>
													</CardContent>
												</Box>
											</Card>
										</Box>
									);
								})}
							</Stack>
						) : namesOnly ? (
							<List dense disablePadding id="acList">
								{filteredLocations.map((loc) => {
									const idx = allLocations.indexOf(loc);
									return (
										<Box
											key={`${loc.name}-${idx}`}
											ref={(el) => {
												itemRefs.current[idx] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 0.5 },
											}}
										>
											<ListItemButton
												dense
												onClick={() => onSelectLocation(idx)}
												sx={{
													borderRadius: `${RX}px`,
													py: 0.75,
													alignItems: "flex-start",
													color: "text.primary",
													"&:hover": {
														bgcolor: "rgba(0,0,0,0.06)",
													},
												}}
											>
												<ListItemText
													primary={loc.name}
													primaryTypographyProps={{
														variant: "body2",
														sx: {
															fontWeight: 500,
															lineHeight: 1.35,
														},
													}}
												/>
											</ListItemButton>
										</Box>
									);
								})}
							</List>
						) : (
							<Stack spacing={1.5} component="div" id="acList">
								{filteredLocations.map((loc) => {
									const idx = allLocations.indexOf(loc);
									const hasUrl = Boolean(loc.url);
									const phoneHref = loc.phone
										? `tel:${loc.phone.replace(/[^0-9+]/g, "")}`
										: "";
									const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
									const img = loc.image || FALLBACK_IMG;

									return (
										<Box
											key={`${loc.name}-${idx}`}
											ref={(el) => {
												itemRefs.current[idx] = el;
											}}
											sx={{
												scrollMarginTop: 1,
												"&:last-child": { mb: 1 },
											}}
										>
											<Card
												variant="outlined"
												sx={{
													borderRadius: `${RX}px`,
													overflow: "hidden",
													borderColor: "grey.400",
													"&:hover": {
														borderColor: "grey.600",
														boxShadow: 1,
													},
												}}
											>
												<Box
													onClick={() => onSelectLocation(idx)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															onSelectLocation(idx);
														}
													}}
													role="button"
													tabIndex={0}
													sx={{
														cursor: "pointer",
														"&:focus-visible": {
															outline: "2px solid",
															outlineColor: "grey.500",
															outlineOffset: 2,
															borderRadius: `${RX}px`,
														},
													}}
												>
													<CardMedia
														component="div"
														sx={{
															height: 200,
															backgroundImage: `url('${img.replace(/'/g, "\\'")}')`,
															backgroundSize: "cover",
															backgroundPosition: "top center",
														}}
													/>
													<CardContent sx={{ pt: 1.5, pb: 2, px: 2, minWidth: 0 }}>
														<Typography
															variant="subtitle1"
															component="h2"
															gutterBottom
														>
															{loc.name}
														</Typography>
														{loc.address ? (
															<Typography
																variant="caption"
																display="block"
																sx={{
																	mb: 0.75,
																	opacity: 0.95,
																}}
															>
																{loc.address}
															</Typography>
														) : null}
														{hasUrl ? (
															<Link
																href={loc.url}
																target="_blank"
																rel="noopener noreferrer"
																variant="caption"
																display="block"
																title={loc.url}
																sx={panelWebsiteLinkSx}
																onClick={(e) => e.stopPropagation()}
															>
																{loc.url}
															</Link>
														) : null}
														<Box
															sx={{
																display: "flex",
																alignItems: "center",
																width: "100%",
																mt: hasUrl ? 0 : 0.5,
																gap: 1,
																minWidth: 0,
															}}
														>
															<Box sx={{ minWidth: 0, flex: 1 }}>
																{loc.phone ? (
																	<Link
																		href={phoneHref}
																		variant="body2"
																		color="text.primary"
																		underline="none"
																		onClick={(e) => e.stopPropagation()}
																	>
																		{loc.phone}
																	</Link>
																) : null}
															</Box>
															<Link
																href={directionsUrl}
																target="_blank"
																rel="noopener noreferrer"
																variant="body2"
																fontWeight={600}
																color="text.secondary"
																aria-label="Get directions"
																underline="none"
																onClick={(e) => e.stopPropagation()}
																sx={{
																	display: "inline-flex",
																	alignItems: "center",
																	ml: "auto",
																	flexShrink: 0,
																}}
															>
																<TurnRightIcon
																	sx={{ fontSize: 28 }}
																	aria-hidden
																/>
															</Link>
														</Box>
													</CardContent>
												</Box>
											</Card>
										</Box>
									);
								})}
							</Stack>
						)}
					</Box>
				</Stack>
			</Paper>
		</Box>
	);
}
