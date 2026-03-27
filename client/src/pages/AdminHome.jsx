import { useEffect, useMemo, useRef, useState } from "react";
import { alpha } from "@mui/material/styles";

import { apiFetch } from "../api";
import AdminReports from "../ui/AdminReports";

import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Stack,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Badge
} from "@mui/material";

/** Icons */
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const API_BASE = "http://localhost:4000";

/**
 * ====== Design tokens (edit these first) ======
 * Keep all “magic colors” & common gradients here so you can tweak the theme quickly.
 */
const UI = {
  colors: {
    navy: "#031B3E",
    blue: "#062A5E",
    blue2: "#0A3A82",
    pageBg: "#EEF4FF",
    textBlue: "#062A5E"
  },
  gradients: {
    appBar: "linear-gradient(135deg, #031B3E 0%, #062A5E 55%, #0A3A82 100%)",
    overviewHeader: "linear-gradient(135deg, #75879e, #c0bfbf)",
    stallsHeader: "linear-gradient(135deg, #031B3E 0%, #062A5E 45%, #0A3A82 100%)",
    reportsHeader:
      "linear-gradient(180deg, rgba(197, 195, 195, 0.32), rgba(197, 195, 195, 0.32))",
    pageBg: `
      linear-gradient(180deg, #c5c5c5c4 100%, #8e9092 55%, #878888c5 100%)
    `
  },
  borders: {
    softBlue: "1px solid rgba(10,58,130,0.14)",
    softDark: "1px solid rgba(11,31,59,0.12)"
  },
  radius: { lg: 3, md: 2, pill: 999 }
};

/**
 * ====== Common sx blocks (edit these to adjust spacing/hover quickly) ======
 */
const SX = {
  paperShell: {
    borderRadius: UI.radius.lg,
    border: UI.borders.softDark,
    overflow: "hidden",
    boxShadow: "0 10px 28px rgba(11,31,59,0.08)"
  },
  topNav: {
    appBar: {
      background: UI.gradients.appBar,
      borderBottom: "1px solid rgba(255,255,255,0.12)"
    },
    helloChip: {
      ml: 2.5, // <-- move Hello Admin right/left here
      borderRadius: UI.radius.pill,
      fontWeight: 900,
      bgcolor: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.20)",
      color: "rgba(255,255,255,0.92)",
      "& .MuiChip-icon": { color: "rgba(255,255,255,0.92)" }
    }
  },
  stalls: {
    header: {
      p: 2,
      color: "#fff",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
      background: UI.gradients.stallsHeader
    },
    headerAccentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 8,
      bgcolor: "rgba(255,255,255,0.18)"
    },
    filterInputRoot: { bgcolor: "rgba(255,255,255,0.92)" },
    filterLabel: {
      fontWeight: 900,
      color: UI.colors.textBlue,
      "&.Mui-focused": { color: UI.colors.textBlue }
    },
    itemSurface: {
      border: UI.borders.softBlue,
      bgcolor: "rgba(10,58,130,0.08)",
      transition:
        "transform 180ms ease, background 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        bgcolor: "#fff",
        boxShadow: "0 18px 36px rgba(11,31,59,0.14)",
        borderColor: "rgba(10,58,130,0.28)"
      }
    }
  }
};

function getStallImageSrc(stall) {
  if (!stall?.image_path) return "";
  if (stall.image_path.startsWith("http")) return stall.image_path;
  return `${API_BASE}/uploads/${stall.image_path}`;
}

function StatusChip({ active }) {
  return (
    <Chip
      size="small"
      icon={active ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
      label={active ? "ACTIVE" : "INACTIVE"}
      sx={{
        fontWeight: 950,
        borderRadius: UI.radius.pill,
        border: "1px solid",
        borderColor: active ? "rgba(11,107,58,0.25)" : "rgba(122,16,32,0.22)",
        bgcolor: active ? "rgba(11,107,58,0.10)" : "rgba(122,16,32,0.08)",
        color: active ? "#0B6B3A" : "#7A1020",
        "& .MuiChip-icon": { color: "inherit" }
      }}
    />
  );
}

function StatCard({ label, value, icon, accent = "#FFD200" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: UI.radius.lg,
        border: UI.borders.softBlue,
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fff",
        boxShadow: "0 10px 28px rgba(11,31,59,0.08)",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 18px 34px rgba(11,31,59,0.14)",
          borderColor: "rgba(10,58,130,0.22)"
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -70,
          right: -70,
          width: 160,
          height: 160,
          borderRadius: UI.radius.pill,
          bgcolor: alpha(accent, 0.22)
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -90,
          left: -90,
          width: 200,
          height: 200,
          borderRadius: UI.radius.pill,
          bgcolor: "rgba(10,58,130,0.06)"
        }}
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "relative" }}>
        <Avatar
          sx={{
            bgcolor: alpha(accent, 0.22),
            color: UI.colors.textBlue,
            border: "1px solid rgba(10,58,130,0.12)"
          }}
        >
          {icon}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: "rgba(11,31,59,0.65)" }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 950, color: UI.colors.textBlue, mt: 0.25 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

/** Stalls list item */
function StallMiniRow({ stall, onEdit }) {
  const imgSrc = getStallImageSrc(stall);
  const isActive = !!stall.is_active;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: UI.radius.lg, ...SX.stalls.itemSurface }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "110px 1fr auto" },
          gap: 2,
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            width: 110,
            height: 85,
            borderRadius: UI.radius.md,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.75)",
            border: UI.borders.softBlue
          }}
        >
          {stall.image_path ? (
            <Box
              component="img"
              src={imgSrc}
              alt={stall.stall_name}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "rgba(6,42,94,0.75)",
                fontWeight: 900,
                fontSize: 12
              }}
            >
              No image
            </Box>
          )}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontWeight: 950, color: UI.colors.textBlue, fontSize: 15 }}>
              #{stall.stall_number} — {stall.stall_name}
            </Typography>
            <StatusChip active={isActive} />
          </Stack>

          <Typography variant="caption" sx={{ color: "rgba(6,42,94,0.72)" }}>
            {stall.id}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit?.(stall)}
            sx={{
              borderRadius: UI.radius.pill,
              fontWeight: 950,
              color: UI.colors.textBlue,
              borderColor: "rgba(10,58,130,0.30)",
              bgcolor: "rgba(255,255,255,0.65)",
              "&:hover": { borderColor: UI.colors.textBlue, bgcolor: "rgba(10,58,130,0.06)" }
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

/** Stalls tile for grid/carousel */
function StallTile({ stall, onEdit }) {
  const imgSrc = getStallImageSrc(stall);
  const isActive = !!stall.is_active;

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: 300,
        borderRadius: UI.radius.lg,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...SX.stalls.itemSurface
      }}
    >
      {stall.image_path ? (
        <CardMedia component="img" image={imgSrc} alt={stall.stall_name} sx={{ height: 170 }} />
      ) : (
        <Box sx={{ height: 170, bgcolor: "rgba(255,255,255,0.75)" }} />
      )}

      <CardContent sx={{ display: "grid", gap: 1, alignContent: "start", flex: "1 1 auto" }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                sx={{
                  fontWeight: 950,
                  fontSize: 14,
                  color: UI.colors.textBlue,
                  minWidth: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
                title={`${stall.stall_number} — ${stall.stall_name}`}
              >
                #{stall.stall_number} — {stall.stall_name}
              </Typography>
              <StatusChip active={isActive} />
            </Stack>

            <Typography
              variant="caption"
              sx={{
                color: "rgba(6,42,94,0.72)",
                mt: 0.5,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
              title={String(stall.id ?? "")}
            >
              {stall.id}
            </Typography>
          </Box>

          <Tooltip title="Edit stall">
            <IconButton
              onClick={() => onEdit?.(stall)}
              sx={{
                border: "1px solid rgba(10,58,130,0.20)",
                bgcolor: "rgba(255,255,255,0.85)",
                color: UI.colors.textBlue,
                "&:hover": { bgcolor: "rgba(10,58,130,0.06)" }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EditStallDialog({ open, stall, onClose, onSaved }) {
  const [form, setForm] = useState({
    stall_name: "",
    stall_number: "",
    is_active: true,
    image_path: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !stall) return;

    setError("");
    setSaving(false);
    setForm({
      stall_name: stall.stall_name ?? "",
      stall_number: String(stall.stall_number ?? ""),
      is_active: !!stall.is_active,
      image_path: stall.image_path ?? "",
      description: stall.description ?? ""
    });
  }, [open, stall]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (!stall?.id) return;

    setError("");
    setSaving(true);

    try {
      await apiFetch(`/api/admin/stalls/${stall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stall_name: form.stall_name,
          stall_number: Number(form.stall_number),
          is_active: !!form.is_active,
          image_path: form.image_path,
          description: form.description
        })
      });

      await onSaved?.();
      onClose?.();
    } catch (e2) {
      setError(e2?.message || "Failed to save stall");
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = form.image_path
    ? form.image_path.startsWith("http")
      ? form.image_path
      : `${API_BASE}/uploads/${form.image_path}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 950, color: UI.colors.textBlue }}>
        Edit stall{stall?.stall_name ? ` — ${stall.stall_name}` : ""}
      </DialogTitle>

      <DialogContent dividers>
        <Stack component="form" onSubmit={submit} spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {/* Flex form layout (replaces Grid) */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <TextField
                label="Stall name"
                value={form.stall_name}
                onChange={(e) => setField("stall_name", e.target.value)}
                placeholder="e.g. Burger Hub"
                fullWidth
                required
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <TextField
                label="Stall number"
                value={form.stall_number}
                onChange={(e) => setField("stall_number", e.target.value)}
                placeholder="e.g. 12"
                inputMode="numeric"
                fullWidth
                required
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <TextField
                label="Image path (or URL)"
                value={form.image_path}
                onChange={(e) => setField("image_path", e.target.value)}
                placeholder="uploads/xxx.jpg or https://..."
                fullWidth
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 8px)" } }}>
              <FormControl fullWidth>
                <InputLabel id="stall-status-label">Status</InputLabel>
                <Select
                  labelId="stall-status-label"
                  label="Status"
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(e) => setField("is_active", e.target.value === "active")}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: "1 1 100%" }}>
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Optional description…"
                fullWidth
                multiline
                minRows={4}
              />
            </Box>
          </Box>

          {previewSrc ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 900, color: UI.colors.textBlue, mb: 1 }}>
                Preview
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 180,
                  borderRadius: UI.radius.lg,
                  overflow: "hidden",
                  border: UI.borders.softDark,
                  bgcolor: "rgba(11,31,59,0.04)"
                }}
              >
                <Box
                  component="img"
                  src={previewSrc}
                  alt="preview"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving} variant="contained">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * ====== Small UI sections (so it's easy to find what to edit) ======
 */

function TopNav({ loading, onRefresh, rolee }) {
  return (
    <AppBar position="sticky" elevation={0} sx={SX.topNav.appBar}>
      <Toolbar sx={{ py: 1.25 }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3 }, maxWidth: "1800px", mx: "auto" }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            {/* Left: brand + Logged in */}
            <Stack direction="row" spacing={2.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#22C55E",
                    color: "#22C55E",
                    boxShadow: "0 0 0 2px rgba(3,27,62,0.9)"
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: "rgba(255,255,255,0.10)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.20)",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.20)"
                  }}
                >
                  <DashboardRoundedIcon />
                </Avatar>
              </Badge>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 1000, letterSpacing: 0.4, lineHeight: 1.05, color: "#fff" }}>
                  UA BiteCheck
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.6 }}>
                  <Chip
                    icon={<BoltRoundedIcon />}
                    label={`Logged in as ${rolee ?? "Admin"}`}
                    size="small"
                    sx={SX.topNav.helloChip}
                  />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.80)" }}>
                    Manage stalls • View reports
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Right: refresh only */}
            <Tooltip title="Refresh stalls">
              <span>
                <IconButton
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: UI.radius.pill,
                    border: "1px solid rgba(255,255,255,0.18)",
                    bgcolor: "rgba(255,255,255,0.10)",
                    color: "#fff"
                  }}
                >
                  {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

function OverviewPanel({ stats }) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...SX.paperShell,
        position: { lg: "sticky" },
        top: { lg: 92 }
      }}
    >
      <Box sx={{ p: 2, color: "#fff", position: "relative", background: UI.gradients.overviewHeader }}>
        <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, bgcolor: "#07234d" }} />
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 120,
            height: 120,
            borderRadius: UI.radius.pill,
            bgcolor: "rgba(8, 35, 85, 0.22)"
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ position: "relative" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "rgba(255,210,0,0.18)",
                border: "1px solid rgba(255,210,0,0.32)",
                color: "#fff"
              }}
            >
              <AssessmentRoundedIcon fontSize="small" />
            </Avatar>
            <Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Admin Overview</Typography>
          </Stack>

          <Chip
            label="LIVE"
            size="small"
            sx={{
              fontWeight: 900,
              borderRadius: UI.radius.pill,
              bgcolor: "rgba(255,210,0,0.18)",
              border: "1px solid rgba(255,210,0,0.28)",
              color: "#fff"
            }}
          />
        </Stack>

        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", color: "rgba(255,255,255,0.86)", position: "relative" }}
        >
          Quick overview of stalls and today’s activity.
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: "grid", gap: 1.25 }}>
        <StatCard label="Total stalls" value={stats.total} icon={<StorefrontRoundedIcon />} accent="#FFD200" />
        <StatCard
          label="Active stalls"
          value={stats.active}
          icon={<LocalFireDepartmentRoundedIcon />}
          accent="#22C55E"
        />
        <StatCard label="Inactive stalls" value={stats.inactive} icon={<CancelRoundedIcon />} accent="#EF4444" />
      </Box>
    </Paper>
  );
}

function ReportsPanel() {
  return (
    <Paper elevation={0} sx={{ ...SX.paperShell, height: "100%" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          background: UI.gradients.reportsHeader
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: "rgba(10,58,130,0.10)", color: UI.colors.textBlue }}>
            <AssessmentRoundedIcon />
          </Avatar>
          <Typography sx={{ fontWeight: 950, fontSize: 16, color: UI.colors.textBlue }}>Reports</Typography>
        </Stack>

        <Chip
          label="Insights & trends"
          size="small"
          sx={{
            borderRadius: UI.radius.pill,
            fontWeight: 900,
            bgcolor: "rgba(10,58,130,0.08)",
            color: UI.colors.textBlue,
            border: "1px solid rgba(10,58,130,0.14)"
          }}
        />
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <AdminReports />
      </Box>
    </Paper>
  );
}

function StallsPanel({
  stalls,
  filteredStalls,
  q,
  setQ,
  err,
  view,
  setView,
  filter,
  setFilter,
  onEditStall,
  carouselRef,
  scrollCarouselBy
}) {
  return (
    <Paper elevation={0} sx={SX.paperShell}>
      <Box sx={SX.stalls.header}>
        <Box sx={SX.stalls.headerAccentBar} />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ position: "relative" }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff"
            }}
          >
            <StorefrontRoundedIcon />
          </Avatar>
          <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Stalls</Typography>
        </Stack>

        {/* ✅ View | Search | Filter */}
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ position: "relative" }}
        >
          {/* View */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.86)", fontWeight: 900 }}>
              View
            </Typography>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, v) => v && setView(v)}
              sx={{
                bgcolor: "rgba(255,255,255,0.92)",
                borderRadius: UI.radius.pill,
                border: "1px solid rgba(255,255,255,0.22)",
                overflow: "hidden",
                "& .MuiToggleButton-root": {
                  border: "none",
                  fontWeight: 950,
                  px: 1.25,
                  color: UI.colors.textBlue
                }
              }}
            >
              <ToggleButton value="list">
                <ViewListRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                List
              </ToggleButton>
              <ToggleButton value="grid">
                <GridViewRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Grid
              </ToggleButton>
              <ToggleButton value="carousel">
                <ViewCarouselRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Carousel
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Search (between view and filter) */}
          <TextField
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stalls…"
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 240, md: 300 },
              "& .MuiOutlinedInput-root": {
                borderRadius: UI.radius.pill,
                bgcolor: "rgba(255,255,255,0.92)"
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: UI.colors.textBlue }} />
                </InputAdornment>
              ),
              endAdornment: q ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQ("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />

          {/* Filter */}
          <FormControl
            size="small"
            sx={{
              minWidth: 190,
              "& .MuiOutlinedInput-root": SX.stalls.filterInputRoot
            }}
          >
            <InputLabel id="stall-filter-label" sx={SX.stalls.filterLabel}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TuneRoundedIcon fontSize="small" />
                <Box component="span" sx={{ fontSize: 14, letterSpacing: 0.2 }}>
                  Filter
                </Box>
              </Stack>
            </InputLabel>
            <Select
              labelId="stall-filter-label"
              label="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active only</MenuItem>
              <MenuItem value="inactive">Inactive only</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {err ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="body2" sx={{ color: "rgba(11,31,59,0.65)" }}>
            Showing{" "}
            <Box component="span" sx={{ fontWeight: 950, color: UI.colors.textBlue }}>
              {filteredStalls.length}
            </Box>{" "}
            of{" "}
            <Box component="span" sx={{ fontWeight: 950, color: UI.colors.textBlue }}>
              {stalls.length}
            </Box>
            {q ? (
              <>
                {" "}
                for “
                <Box component="span" sx={{ fontWeight: 950, color: UI.colors.textBlue }}>
                  {q}
                </Box>
                ”
              </>
            ) : null}
          </Typography>

          {q ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setQ("")}
              sx={{ borderRadius: UI.radius.pill, fontWeight: 900 }}
            >
              Clear search
            </Button>
          ) : null}
        </Stack>

        {view === "list" ? (
          <Stack spacing={1.5}>
            {filteredStalls.map((s) => (
              <StallMiniRow key={s.id} stall={s} onEdit={onEditStall} />
            ))}
            {filteredStalls.length === 0 ? (
              <Typography sx={{ color: "rgba(11,31,59,0.65)", py: 1 }}>No stalls match your search.</Typography>
            ) : null}
          </Stack>
        ) : view === "grid" ? (
          <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "stretch" }}>
              {filteredStalls.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: "flex",
                    flex: {
                      xs: "1 1 100%",
                      sm: "1 1 calc(50% - 12px)",
                      md: "1 1 calc(25% - 12px)"
                    },
                    minWidth: 0
                  }}
                >
                  <StallTile stall={s} onEdit={onEditStall} />
                </Box>
              ))}
            </Box>

            {filteredStalls.length === 0 ? (
              <Typography sx={{ color: "rgba(11,31,59,0.65)", py: 1 }}>No stalls match your search.</Typography>
            ) : null}
          </Box>
        ) : (
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }} spacing={1}>
              <Typography variant="body2" sx={{ color: "rgba(11,31,59,0.65)" }}>
                Swipe/scroll horizontally, or use arrows.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => scrollCarouselBy(-1)}
                  startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                  sx={{ borderRadius: UI.radius.pill, fontWeight: 950 }}
                >
                  Left
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => scrollCarouselBy(1)}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  sx={{ borderRadius: UI.radius.pill, fontWeight: 950 }}
                >
                  Right
                </Button>
              </Stack>
            </Stack>

            <Box
              ref={carouselRef}
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: { xs: "260px", sm: "320px", lg: "360px" },
                gap: 1.5,
                overflowX: "auto",
                pb: 1,
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                alignItems: "stretch",
                px: 0.25,
                "& > *": {
                  scrollSnapAlign: "start",
                  height: "100%",
                  display: "flex"
                }
              }}
            >
              {filteredStalls.map((s) => (
                <Box key={s.id} sx={{ display: "flex" }}>
                  <StallTile stall={s} onEdit={onEditStall} />
                </Box>
              ))}
            </Box>

            {filteredStalls.length === 0 ? (
              <Typography sx={{ color: "rgba(11,31,59,0.65)", py: 1 }}>No stalls match your search.</Typography>
            ) : null}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default function AdminHome() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | inactive

  const [view, setView] = useState("list"); // list | grid | carousel
  const carouselRef = useRef(null);

  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  // 🔧 set this to whatever role string you have (from auth, etc.)
  const rolee = "Admin";

  async function loadStalls() {
    setErr("");
    setLoading(true);

    try {
      const d = await apiFetch("/api/admin/stalls");
      setStalls(d.stalls || []);
    } catch (e) {
      setErr(e.message || "Failed to load stalls");
      setStalls([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStalls().catch(() => {});
  }, []);

  const stats = useMemo(() => {
    return {
      total: stalls.length,
      active: stalls.filter((s) => s.is_active).length,
      inactive: stalls.filter((s) => !s.is_active).length
    };
  }, [stalls]);

  const filteredStalls = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = stalls;
    if (filter === "active") list = list.filter((s) => !!s.is_active);
    if (filter === "inactive") list = list.filter((s) => !s.is_active);

    if (!query) return list;

    return list.filter((s) => {
      const hay = [s.stall_name, String(s.stall_number ?? ""), String(s.id ?? "")]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [stalls, q, filter]);

  const scrollCarouselBy = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const handleEditStall = (stall) => {
    setEditing(stall);
    setEditOpen(true);
  };

  const handleSaved = async () => {
    await loadStalls();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: "system-ui, Arial",
        bgcolor: UI.colors.pageBg,
        backgroundImage: UI.gradients.pageBg,
        pb: 3
      }}
    >
      <EditStallDialog
        open={editOpen}
        stall={editing}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />

      <TopNav loading={loading} onRefresh={loadStalls} rolee={rolee} />

      <Container
        maxWidth={false}
        disableGutters
        sx={{ mt: 2.25, px: { xs: 2, sm: 3 }, maxWidth: "1800px", mx: "auto" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.25, alignItems: "stretch" }}>
            <Box sx={{ flex: { xs: "1 1 100%", lg: "0 0 calc(25% - 18px)" }, minWidth: 0 }}>
              <OverviewPanel stats={stats} />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 calc(75% - 18px)" }, minWidth: 0 }}>
              <ReportsPanel />
            </Box>
          </Box>

          <Box sx={{ width: "100%", minWidth: 0 }}>
            <StallsPanel
              stalls={stalls}
              filteredStalls={filteredStalls}
              q={q}
              setQ={setQ}
              err={err}
              view={view}
              setView={setView}
              filter={filter}
              setFilter={setFilter}
              onEditStall={handleEditStall}
              carouselRef={carouselRef}
              scrollCarouselBy={scrollCarouselBy}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}