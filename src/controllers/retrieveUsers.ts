import {success, wrapRequestHandler} from "../helpers/response";
import {retrieveRouter} from "../routes/retrieveRouter";
import {RequestHandler} from "express";
import {User} from "../models/User";
import {paginateAggregate} from "../helpers";
import {validate} from "../helpers/validations";
import {sanitizeQuery} from "express-validator";
import escapeStringRegexp from "escape-string-regexp";
import {authMiddleware} from "../middleware/authMiddleware";

const handler: RequestHandler = async (req, res) => {
    const {page, search, is_active, limit, order = "desc", sort_by = "createdAt"} = req.query;

    const query = User.aggregate();

    if (search)
        query.match({
            $or: [
                {
                    username: {
                        $regex: escapeStringRegexp(search),
                        $options: "i"
                    }
                },
                {
                    name: {
                        $regex: escapeStringRegexp(search),
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: escapeStringRegexp(search),
                        $options: "i"
                    }
                }
            ]
        });

    if (sort_by)
        query.sort({[sort_by]: order});

    if (is_active === "true" || is_active === "false")
        query.match({is_active: is_active === "true"});

    const [users, total] = await paginateAggregate(query, {
        page,
        limit
    });

    res.json(success("Success", {
        users,
        total
    }));
};

retrieveRouter
    .get("/users", authMiddleware(), validate([
        sanitizeQuery("page").toInt(),
        sanitizeQuery("limit").toInt()
    ]), wrapRequestHandler(handler));
