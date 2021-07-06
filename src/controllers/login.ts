import {error, messages, success, wrapRequestHandler} from "../helpers/response";
import {UserToken, UserTokenType} from "../models/UserToken";
import {User} from "../models/User";
import {matchCaseInsensitive, matchPasswords} from "../helpers";
import {validate} from "../helpers/validations";
import {LOGIN_TOKEN, TFA_TOKEN} from "../constants";
import {body} from "express-validator";
import {apiRouter} from "../routes/apiRouter";
import {RequestHandler} from "express";

const handler: RequestHandler = async (req, res) => {
    const {
        username,
        password,
        otp,
        send_otp,
        app,
        fcm_token
    } = req.body;

    const query = User.findOne({
        $or: [
            {username: matchCaseInsensitive(username)},
            {email: matchCaseInsensitive(username)}
        ]
    });

    if (app)
        query.where({app_names: app});

    const user = await query.exec();

    if (!user)
        return res.json(error(messages().user_not_found));

    if(!user.is_active)
        return res.json(error(messages().account_disabled));

    if (!matchPasswords(user.password, password))
        return res.json(error("Invalid Password"));

    if (user.two_factor_authentication){
        if (send_otp){
            const token = await user.createTwoFactorAuthToken();
            // noinspection ES6MissingAwait
            // user.sendTwoFactorAuthSMS({token});
            return res.json(success(messages().otp_sent, token));
        } else if (otp){
            const tfaToken = await UserToken.findOne({
                type: TFA_TOKEN,
                user_id: user._id,
                expiry: {$gt: new Date()}
            }).sort({createdAt: "desc"});

            if (!tfaToken || !tfaToken.matchOtp(otp))
                throw new Error(messages().invalid_otp);

            await UserToken.deleteMany({
                user_id: user._id,
                type: TFA_TOKEN
            }).exec();
        } else {
            throw new Error(messages().otp_required);
        }
    }

    const token = new UserToken();

    Object.assign(token, <Partial<UserTokenType>>{
        user_id: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        fcm_token,
        app_name: app,
        type: LOGIN_TOKEN
    });

    await token.save();

    user.logged_in_at = new Date();

    await user.save();

    await token.populate("user").execPopulate();

    return res.json(success(messages().logged_in, token.toJSON()));
};

apiRouter.post("/login", validate([
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
]), wrapRequestHandler(handler));
