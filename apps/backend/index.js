import express from "express";
import cors from "cors";
import "dotenv/config";
import db from "./config/db.js";
import helmet from "helmet";
import compression from "compression";
import route from "./route.js";
import http from "http";
process.env.TZ = "Etc/UTC";

if (!process.env.PORT) {
  throw new Error("PORT environment variable is not defined");
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
const server = http.createServer(app);

app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

app.use('/api/user',route);
app.get("/",(req,res)=>{
  res.status(200).json({
    message:"Welcome to backend",
    status:true
  })
})


const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.connection.asPromise();
    console.log("Connect to the database successfully");
    server.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect to the database");
  }
};
start();

const graceful = () => {
  db.connection.close();
  console.log("Database connection closed");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
