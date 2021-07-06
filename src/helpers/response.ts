import {RequestHandler} from "express";

export interface RestApiResponse<T> {
    data?: T,
    type?: "error" | "success",
    message?: string,
    errors?: any[]
}

export interface AppNameRestApiResponse<T> {
    data?: T,
    type?: "error" | "success",
    message?: string,
    errors?: any[],
    status_msg: string,
    status_code: string,
}

export function success<T = any> (message: string, data: T = null): RestApiResponse<T>{
    return {
        data,
        type: "success",
        message
    };
}

export function error<T = any> (message: string, errors: any[] = [], data: T = null): RestApiResponse<T>{
    return {
        data,
        errors,
        message,
        type: "error"
    };
}

export function response<T = any> (data: T, message = "Success"): RestApiResponse<T>{
    return {
        data,
        type: "success",
        message
    };
}

export function appNameApiSuccess<T = any> (message: string, data: T = null): AppNameRestApiResponse<T>{
    return {
        data,
        type: "success",
        message,
        status_msg: "OK",
        status_code: "200",
    };
}

export function appNameApiResponse<T = any> (data: T, message = "Success"): AppNameRestApiResponse<T>{
    return {
        data,
        type: "success",
        message,
        status_msg: "OK",
        status_code: "200",
    };
}
//@ts-ignore
export const wrapRequestHandler = (fn: RequestHandler) => (req, res, next) => fn(req, res, next).catch(next);

export const messages = () => ({
    logged_in: "Logged In",
    user_not_found: "User not found",
    account_disabled: "Your account has not been active",
    invalid_password: "Invalid Password",
    invalid_otp: "Invalid OTP",
    otp_required: "OTP is required to sign in",
    otp_sent: "OTP sent on your phone number"
});
