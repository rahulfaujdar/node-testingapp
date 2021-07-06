import {getLoginTokenFromRequest} from "../models/UserToken";
import {success, wrapRequestHandler} from "../helpers/response";
import {retrieveRouter} from "../routes/retrieveRouter";
import {authMiddleware} from "../middleware/authMiddleware";
import {RequestHandler} from "express";

const handler: RequestHandler = async (req, res) => {
    const token = await getLoginTokenFromRequest(req);

    const {user} = token;

    res.json(success("", user));
};

retrieveRouter
    .get("/user", authMiddleware(), wrapRequestHandler(handler));
