import {UserToken} from "../models/UserToken";
import {error} from "../helpers/response";
import {Types} from "mongoose";
import {RequestHandler} from "express";
import {LOGIN_TOKEN} from "../constants";

export const authMiddleware = (): RequestHandler => async (req, res, next) => {
    let token_id:any = req.headers.authorization || req.query.token_id || "";

    token_id = token_id.replace("Bearer ", "");

    const errorMessage = "Invalid Token or Token Expired";

    if (!token_id || !Types.ObjectId.isValid(token_id))
        return res.json(error(errorMessage));

    const token = await UserToken.findOne({
        _id: token_id,
        type: LOGIN_TOKEN
    })
        .populate("user");

    if (!token || !token.user)
        return res.json(error(errorMessage));

    const {user} = token;

    if (!user.is_active)
        return res.json({
            ...error("Your account is not active."),
            user_disabled: true
        });

    // @ts-ignore
    req.login_token = token;

    next();
};
