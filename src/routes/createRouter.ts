import {Router} from "express";
import {apiRouter} from "./apiRouter";

export const createRouter = Router();

apiRouter.use("/create", createRouter);
