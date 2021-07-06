import {getLoginTokenFromRequest} from "../models/UserToken";
import {success} from "../helpers/response";
import {authMiddleware} from "../middleware/authMiddleware";
import {apiRouter} from "../routes/apiRouter";

apiRouter.post("/logout", authMiddleware(), async (req, res) => {
    const token = await getLoginTokenFromRequest(req);

    await token.remove();

    return res.json(success("Logged Out"));
});
