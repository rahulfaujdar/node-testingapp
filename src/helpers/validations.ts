import {RequestHandler} from "express";
import {isString} from "lodash";
import {validationResult} from "express-validator";
import {error} from "./response";

export const validate = validations => {
    return async (req, res, next) => {
        await validations.reduce(async (promise, validation) => {
            await promise;
            return validation.run(req);
        }, Promise.resolve());

        const errors = validationResult(req);
        if (errors.isEmpty()){
            return next();
        }

        const errorsArray = errors.array();
        res.json(error(errorsArray[0].msg, errorsArray));
    };
};

export const validateEmail = string => !!string.trim().match(/^([a-z0-9_\-.])+@([a-z0-9_\-.])+\.([a-z]{2,4})$/i);

export const validatePhone = string => !!string.replace(/[-()\s]/g, "").trim().match(/^\+?[1-9]{0,3}[0-9]{10}$/);

export const validateNumber = string => !!string.trim().match(/^\+?[0-9]{10}$/);

export const postTrimmer: RequestHandler = (req, res, next) => {
    if (req.method === "POST"){
        for (const [key, value] of Object.entries(req.body)){
            if (isString(value))
                // @ts-ignore
                req.body[key] = value.trim();
        }
    }
    next();
};

export const validateEmoji = () => string => {
    const match = isString(string) && string.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/);
    if (match)
        throw new Error("Invalid Value");
    return !match;
};

export const validateCountryCode = string => !!string.match(/^\+?(1|52)[0-9]{10}$/);

export const validatePasswordStrength = password => {
    const valid = password.length >= 8 && password.match(/[0-9]+/) && password.match(/[a-z]+/) && password.match(/[A-Z]+/) && password.match(/[!@#$%^&*]+/);
    if (!valid)
        throw new Error("Password must contain at least 8 characters, including numbers, a special characters(!@#$%^&*), an uppercase character and a lowercase character.");
    return valid;
};
