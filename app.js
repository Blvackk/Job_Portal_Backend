import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import { newsLetterCron } from "./automation/newsLetterCrons.js";



const app = express();
config({ path: "./config/config.env" });


// app.use(cors({
//     origin: [process.env.FRONTEND_URI],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));


const allowedOrigins = [
  "https://job-portal-liard-zeta.vercel.app", // your deployed FE
  "http://localhost:5173",                    // local dev
];

const corsOptionsDelegate = (origin, callback) => {
  // allow non-browser tools (e.g., Postman) with no Origin
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

app.use(
  cors({
    origin: corsOptionsDelegate,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Ensure preflight always succeeds with same policy
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);


// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);


app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);


newsLetterCron();
connection();
app.use(errorMiddleware);

export default app;
