import * as mongoose from "mongoose";
import {Schema, Types} from "mongoose";
import {UserType} from "./User";
import {Request} from "express";
import {Request as ValidatorRequest} from "express-validator/src/base";
import {LOGIN_TOKEN} from "../constants";
import moment from "moment";

const schema = new mongoose.Schema({
    user_id: Schema.Types.ObjectId,
    fcm_token: String,
    expiry: Date,
    name: String,
    type: String,
    otp: String,
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc: UserTokenType, ret: UserTokenType) => {
            delete ret.otp;
            return ret;
        }
    },
    minimize: false
});

export interface UserTokenType extends mongoose.Document {
    user_id?: Types.ObjectId,
    expiry: Date,
    user?: UserType,
    name?: string,
    fcm_token?: string,
    otp?: string,
    createdAt?: Date,
    updatedAt?: Date,
    meta: any,

    matchOtp(otp: string): boolean
}

schema.virtual("user", {
    ref: "User",
    localField: "user_id",
    foreignField: "_id",
    justOne: true
});

schema.pre("save", function (this: UserTokenType){
    if (this.otp && !this.expiry)
        this.expiry = moment().add(24, "h").toDate();
});

schema.methods.matchOtp = function (this: UserTokenType, otp: string){
    return this.otp === String(otp);
};

export const UserToken = mongoose.model<UserTokenType>("UserToken", schema);

export const getLoginTokenFromRequest = async (req: Request | ValidatorRequest): Promise<UserTokenType> => {
    // @ts-ignore
    let {login_token}: { login_token: UserTokenType } = req;

    if (!login_token){
        let token_id = req.headers.authorization || req.query.token_id || "";
        token_id = token_id.replace("Bearer ", "");
        login_token = await UserToken.findOne({
            _id: token_id,
            type: LOGIN_TOKEN
        });
    }

    return login_token;
};
