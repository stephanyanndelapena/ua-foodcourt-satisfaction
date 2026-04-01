require("dotenv").config();

const { initDb } = require("./initDb");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const { pool } = require("./db");

const authRoutes = require("./routes/auth");
const stallsRoutes = require("./routes/stalls");
const evalRoutes = require("./routes/evaluations");
const adminRoutes = require("./routes/admin");

const app = express();

// Required on Render (reverse proxy) so secure cookies work
app.set("trust proxy", 1);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const isProd = process.env.NODE_ENV === "production";
const clientOrigin = process.env.CLIENT_ORIGIN;

if (isProd && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production");
}

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / health check requests (no Origin header)
      if (!origin) return cb(null, true);

      // In production, require CLIENT_ORIGIN
      if (!clientOrigin) return cb(new Error("CLIENT_ORIGIN is not set"), false);

      return cb(null, origin === clientOrigin);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Sessions stored in Postgres
app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || "ua_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      pool,
      tableName: "session"
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// Serve local uploaded images
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/stalls", stallsRoutes);
app.use("/api/evaluations", evalRoutes);
app.use("/api/admin", adminRoutes);

const port = process.env.PORT || 4000;

(async () => {
  await initDb(pool);
  app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
})().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});