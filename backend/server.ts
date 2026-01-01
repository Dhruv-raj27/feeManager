import express from "express";
import cors from "cors";
import { initDB } from "./db/initDB";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initDB();

app.get("/health", (_, res) => {
    res.json({status: "Backend running"});
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});