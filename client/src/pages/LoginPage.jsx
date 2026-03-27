import { useState } from "react";
import { apiFetch } from "../api";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";

const UI = {
  colors: {
    bg: "#FFFFFF",
    text: "#0B1F3B",
    muted: "rgba(11, 31, 59, 0.65)",
    border: "rgba(11, 31, 59, 0.14)",
    red: "#7A1020"
  }
};

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      await onLogin();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", bgcolor: UI.colors.bg }}>
      {/* LEFT BG AREA */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: { xs: "inset(0 0 0 0)", md: "inset(0 38% 0 0)" }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("/src/images/bg.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.12)",
            animation: "float 12s ease-in-out infinite"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(165deg, rgba(37,23,97,0.3) 0%, rgba(0,0,0,0.9) 100%)"
          }}
        />
        <Box sx={{ position: "absolute", inset: 0, display: "flex", placeItems: "center", p: 50 }}>
          <Box
            component="img"
            src="/src/images/logo1.png"
            alt="UA BiteCheck"
            sx={{
              width: 350,
              height: "auto",
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))",
              animation: "float 6s ease-in-out infinite"
            }}
          />
        </Box>
      </Box>

      {/* RIGHT LOGIN AREA */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, md: 6 },
          width: { xs: "100%", md: "38%" },
          ml: { xs: 0, md: "auto" }
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography sx={{ color: UI.colors.text, fontWeight: 900, mb: 1.5, fontSize: 24 }}>
            Login to UA BiteCheck
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              border: `1px solid ${UI.colors.border}`,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px) scale(1.02)",
                boxShadow: "0 25px 70px rgba(0,0,0,0.2)"
              }
            }}
          >
            <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 1.5 }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(201,162,39,0.35)"
                    }
                  }
                }}
              />

              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(201,162,39,0.35)"
                    }
                  }
                }}
              />

              {err ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {err}
                </Alert>
              ) : null}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 0.5,
                  borderRadius: 2,
                  py: 1.25,
                  fontWeight: 900,
                  bgcolor: UI.colors.text,
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "#08182f", transform: "scale(1.05)" }
                }}
              >
                Login
              </Button>

              <Box sx={{ mt: 1.5, color: UI.colors.muted, fontSize: 13 }}>
                <Typography sx={{ fontWeight: 900, color: UI.colors.text, mb: 0.75 }}>Seed accs:</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.25, display: "grid", gap: 0.75 }}>
                  <li>
                    <Box component="strong" sx={{ color: UI.colors.text }}>
                      Admin:
                    </Box>{" "}
                    admin@ua.edu / Admin123!
                  </li>
                  <li>
                    <Box component="strong" sx={{ color: UI.colors.text }}>
                      Student:
                    </Box>{" "}
                    student@ua.edu / Student123!
                  </li>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Floating animation keyframes */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </Box>
  );
}