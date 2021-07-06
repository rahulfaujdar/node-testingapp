import {Router} from "express";
import {app} from "../app";

export const apiRouter = Router();
export const dataApiRouter = Router();
export const realtimeRouter = Router();

app.use("/api", apiRouter);

apiRouter.use("/data", dataApiRouter);

app.use(realtimeRouter);

