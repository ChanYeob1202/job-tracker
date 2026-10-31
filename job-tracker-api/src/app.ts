import express, { type Express} from "express";
export const app: Express = express();


app.get("/health", (req, res) => {
    res.status(200);
    res.json("app is connected")
})
