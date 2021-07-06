import {createRouter} from "../routes/createRouter";
import {authMiddleware} from "../middleware/authMiddleware";
import {validate, validateEmail} from "../helpers/validations";
import {body} from "express-validator";
import {success, wrapRequestHandler} from "../helpers/response";
import {RequestHandler} from "express";
import {validateCountryCode, validatePasswordStrength, validatePhone} from "../helpers/validations";
import {User, UserType} from "../models/User";
import {encryptPassword} from "../helpers";

const handler: RequestHandler = async function (req, res){
    const {name, email, phone, password, two_factor_authentication} = req.body;

    const user = new User(<Partial<UserType>>{
        name,
        email,
        phone,
        password: encryptPassword(password),
        two_factor_authentication
    });

    await user.save();

    res.json(success("User Created", {user}));
};

createRouter.post("/user", authMiddleware(), validate([
    body("name").notEmpty().withMessage("Name is required")
        .isLength({max: 20}).withMessage("Name must be 20 characters long"),
    body("phone")
        .custom(async (phone, {req}) => {
            const {two_factor_authentication} = req.body;

            if ((two_factor_authentication && !phone))
                throw new Error("Phone number is required");

            if (phone){
                if (!validatePhone(phone))
                    throw new Error("Please enter valid phone number");

                if (!validateCountryCode(phone))
                    throw new Error("Invalid phone number, only allowed for (india)");

                const exists = await User.exists({phone});

                if (exists)
                    throw new Error("Phone number already in use");
            }

            return true;
        }),
    body("email").custom(async (email) => {
        if (email){
            if (!validateEmail(email))
                throw new Error("Please enter valid Email");

            const exists = await User.exists({email});

            if (exists)
                throw new Error("Email already in use");
        }
    }),
    body("password").notEmpty().withMessage("Password is required")
        .custom(async (password) => {
            if (password){
                validatePasswordStrength(password);
            }
            return true;
        }),
    body("confirm_password").notEmpty().withMessage("Confirm Password is required")
        .custom(async (confirm_password, {req}) => {
            const {password} = req.body;

            if (password !== confirm_password){
                throw new Error("Confirm password should match password field.");
            }
        })
]), wrapRequestHandler(handler));