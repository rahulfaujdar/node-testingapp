import {success, wrapRequestHandler} from "../helpers/response";
import {authMiddleware} from "../middleware/authMiddleware";
import {RequestHandler} from "express";
import {deleteRouter} from "../routes/deleteRouter";
import {User} from "../models/User";
import {validate} from "../helpers/validations";
import {body} from "express-validator";

const handler: RequestHandler = async (req, res) => {
    const {id} = req.body;

    const user = User.findOne({_id: id});

    await user.remove();

    res.json(success("User Deleted"));
};

deleteRouter
    .delete("/user", authMiddleware(), validate([
        body("id").notEmpty().withMessage("Id is required")
    ]), wrapRequestHandler(handler));
