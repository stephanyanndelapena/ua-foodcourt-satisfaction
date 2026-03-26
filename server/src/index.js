require("dotenv").config();

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

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || "ua_sid",
    secret: 'replace_this_with_a_long_random_string',
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      pool,
      tableName: "session"
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
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
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));