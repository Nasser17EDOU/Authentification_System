import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import cors from "cors";
import http from "http";
import logger from "./utils/logger.utils";
import { getDbPool, initializeDatabase } from "./database/db_init";

dotenv.config();
const MySQLStore = MySQLStoreFactory(session);

const app: Express = express();
const server = http.createServer(app);
const pool = getDbPool();
const sessionStore: InstanceType<typeof MySQLStore> = new MySQLStore({}, pool);

const sessionOptions: session.SessionOptions = {
  name: process.env.SESSION_NAME as string,
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV === "development" ? undefined : "none",
    maxAge: 1000 * 60 * 60, // 1 hour
  },
  proxy: true, // ESSENTIAL for Cloudflare headers
};

const allowedOrigins = process.env
  .ALLOWED_ORIGINS!.split(",")
  .map((origin: string) => origin.trim());

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true); // Allow non-browser tools like curl/postman

      if (allowedOrigins.includes(origin)) {
        logger.info(`Allowed CORS for origin: ${origin}`);
        return callback(null, true);
      }

      logger.warn(`Blocked CORS for origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.set("trust proxy", 1);

app.use(session(sessionOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbStatus: "connected", // You can enhance this with actual DB check
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);
  res.json({
    success: false,
    message:
      "Une erreur est survenue. Réessayez plus tard. Si cela persiste, contactez l'Administrateur.",
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.error(`404: ${req.method} ${req.path}`);
  res.json({
    success: false,
    message: "Route non trouvée.",
  });
});

// Routes
// app.use("/auth", authRouter);
// app.use("/user", userRouter);
// app.use("/password", passwordRouter);
// app.use("/profil", profileRouter);
// app.use("/departement", departRouter);
// app.use("/employe", employeRouter);
// app.use("/mission", missionRouter);

async function startServer() {
  try {
    await initializeDatabase();

    server.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  } catch (startupError) {
    logger.error("Server startup failed:", startupError);
    process.exit(1);
  }
}

startServer();
