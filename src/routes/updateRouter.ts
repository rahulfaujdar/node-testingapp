import {Router} from "express";
import {apiRouter} from "./apiRouter";

export const updateRouter = Router();

apiRouter.use("/update", updateRouter);
