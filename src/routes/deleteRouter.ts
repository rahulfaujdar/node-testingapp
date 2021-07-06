import {Router} from "express";
import {apiRouter} from "./apiRouter";

export const deleteRouter = Router();

apiRouter.use("/delete", deleteRouter);
