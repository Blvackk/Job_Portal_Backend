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
  // "https://job-portal-liard-zeta.vercel.app",
  "https://job-portal-1nv5h3c2f-pratiks-projects-0927266a.vercel.app",
  "http://localhost:5173", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
