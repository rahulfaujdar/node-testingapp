import {Router} from "express";
import {apiRouter} from "./apiRouter";

export const retrieveRouter = Router();

apiRouter.use("/retrieve", retrieveRouter);
