import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api";
import EvaluationForm from "../ui/EvaluationForm";

import {
  Box,
  Container,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Button,
  Alert,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

/** Icons */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SearchIcon from "@mui/icons-material/Search";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const API_BASE = "http://localhost:4000";

// ✅ one size for cards (used by grid + carousel)
const CARD_W = 260;
const CARD_H = 260;
const CARD_IMG_H = 150;

function getStallImageSrc(stall) {
  if (!stall?.image_path) return "";
  if (stall.image_path.startsWith("http")) return stall.image_path;
  return `${API_BASE}/uploads/${stall.image_path}`;
}

function StallCard({ stall, onClick }) {
  const imgSrc = getStallImageSrc(stall);

  return (
    <Card
      onClick={onClick}
      sx={{
        width: CARD_W, // ✅ fixed
        height: CARD_H, // ✅ fixed
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        cursor: "pointer",
        background: "#f4f6f8",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",

        "&:hover .stall-img::after": { opacity: 1 },

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
          background: "#eef1f4"
        }
      }}
    >
      <CardActionArea sx={{ height: "100%" }}>
        <Box
          className="stall-img"
          sx={{
            height: CARD_IMG_H,
            overflow: "hidden",
            position: "relative",

            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(3,27,62,0.0) 0%, rgba(6,42,94,0.0) 40%, rgba(7, 31, 68, 0.82) 100%)",
              opacity: 0,
              transition: "opacity 180ms ease",
              pointerEvents: "none"
            }
          }}
        >
          {stall.image_path ? (
            <CardMedia
              component="img"
              image={imgSrc}
              alt={stall.stall_name}
              sx={{ height: "100%", width: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>No image</Box>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 0
          }}
        >
          <Typography fontWeight={700} noWrap>
            {stall.stall_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stall #{stall.stall_number}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default function StudentHome() {
  const [stalls, setStalls] = useState([]);
  const [selected, setSelected] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // "grid" | "carousel"

  const carouselRef = useRef(null);

  async function loadStalls() {
    try {
      setErr("");
      const data = await apiFetch(`${API_BASE}/api/stalls`);
      setStalls(data.stalls || []);
    } catch (e) {
      setErr(e.message || "Failed to load stalls");
      setStalls([]);
    }
  }

  useEffect(() => {
    loadStalls();
  }, []);

  const filteredStalls = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stalls;

    return stalls.filter(
      (s) =>
        String(s.stall_name ?? "").toLowerCase().includes(q) ||
        String(s.stall_number ?? "").includes(search)
    );
  }, [stalls, search]);

  const scrollCarouselBy = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(CARD_W, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B1F3B, #040a14)" }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiEventsIcon sx={{ color: "#C9A227" }} />
            <Typography variant="h5" fontWeight={900} color="white">
              Student Evaluation Portal
            </Typography>
          </Stack>

          {msg && <Alert severity="success">{msg}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}

          {!selected ? (
            <>
              <TextField
                placeholder="Search stalls by name or number..."
                variant="outlined"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ bgcolor: "white", borderRadius: 2 }}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography variant="h6" fontWeight={800} color="white">
                  Browse Stalls
                </Typography>

                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={view}
                  onChange={(_, v) => v && setView(v)}
                  sx={{
                    bgcolor: "white",
                    borderRadius: 999,
                    overflow: "hidden",
                    "& .MuiToggleButton-root": { border: "none", fontWeight: 900 }
                  }}
                >
                  <ToggleButton value="grid">
                    <GridViewRoundedIcon fontSize="small" style={{ marginRight: 6 }} />
                    Grid
                  </ToggleButton>
                  <ToggleButton value="carousel">
                    <ViewCarouselRoundedIcon fontSize="small" style={{ marginRight: 6 }} />
                    Carousel
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {view === "grid" ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "stretch"
                  }}
                >
                  {filteredStalls.map((stall) => (
                    <Box
                      key={stall.id}
                      sx={{
                        display: "flex",
                        flex: "0 0 auto" // ✅ do not stretch; fixed-size cards
                      }}
                    >
                      <StallCard stall={stall} onClick={() => setSelected(stall)} />
                    </Box>
                  ))}

                  {filteredStalls.length === 0 ? (
                    <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>No stalls match your search.</Typography>
                  ) : null}
                </Box>
              ) : (
                <Box>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => scrollCarouselBy(-1)}
                      startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                      sx={{ borderRadius: 999, bgcolor: "#C9A227", "&:hover": { bgcolor: "#b8931f" } }}
                    >
                      Left
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => scrollCarouselBy(1)}
                      endIcon={<ArrowForwardIosIcon fontSize="small" />}
                      sx={{ borderRadius: 999, bgcolor: "#C9A227", "&:hover": { bgcolor: "#b8931f" } }}
                    >
                      Right
                    </Button>
                  </Stack>

                  <Box
                    ref={carouselRef}
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      gap: 2,
                      py: 1,
                      scrollBehavior: "smooth",
                      "&::-webkit-scrollbar": { height: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(201,162,39,0.6)",
                        borderRadius: 2
                      }
                    }}
                  >
                    {filteredStalls.map((stall) => (
                      <Box key={stall.id} sx={{ flex: "0 0 auto" }}>
                        <StallCard stall={stall} onClick={() => setSelected(stall)} />
                      </Box>
                    ))}
                  </Box>

                  {filteredStalls.length === 0 ? (
                    <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>No stalls match your search.</Typography>
                  ) : null}
                </Box>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={() => setSelected(null)}
                variant="contained"
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 3, bgcolor: "#C9A227", "&:hover": { bgcolor: "#b8931f" } }}
              >
                Back
              </Button>

              <Paper sx={{ p: 4, borderRadius: 3, background: "#f4f6f8", mt: 2 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Evaluate: {selected.stall_name} (#{selected.stall_number})
                </Typography>

                <EvaluationForm
                  stall={selected}
                  onSubmitted={(info) => {
                    setMsg(`Submitted! Date: ${info.eval_date}`);
                    setSelected(null);
                  }}
                />
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}