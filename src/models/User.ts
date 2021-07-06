import * as mongoose from "mongoose";
import {Schema} from "mongoose";
import {UserToken, UserTokenType} from "./UserToken";
import {LOGIN_TOKEN, RESET_PASSWORD_TOKEN, TFA_TOKEN} from "../constants";
import {generateOtp} from "../helpers";

const schema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    username: String,
    email: String,
    phone: String,
    password: String,
    password_change_required: {
        type: Schema.Types.Boolean,
        default: false
    },
    two_factor_authentication: {
        type: Schema.Types.Boolean,
        default: false
    },
    logged_in_at: Date,
    is_active: {
        type: Schema.Types.Boolean,
        default: true
    },
    active_status_updated_at: Date,
    permissions: [String],
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    toJSON: {virtuals: true},
    timestamps: true,
    minimize: false
});

schema.methods.hasPermission = function (this: UserType, code){
    return this.permissions.includes(code);
};

schema.methods.createResetPasswordToken = async function (this: UserType){
    const otp = generateOtp();

    const token = new UserToken(<Partial<UserTokenType>>{
        type: RESET_PASSWORD_TOKEN,
        otp,
        user_id: this._id
    });

    await token.save();

    return token;
};

schema.methods.createTwoFactorAuthToken = async function (this: UserType){
    const otp = generateOtp();

    const token = new UserToken(<Partial<UserTokenType>>{
        type: TFA_TOKEN,
        otp,
        user_id: this._id
    });

    await token.save();

    return token;
};

schema.methods.logoutFromAllDevices = async function (this: UserType){
    const tokens = await UserToken.find({
        user_id: this._id,
        type: LOGIN_TOKEN
    });

    await Promise.all(tokens.map(async token => {
        await token.remove();
    }));
};

schema.methods.setMeta = function (this: UserType, name: string, value: any){
    this.meta = {
        ...this.meta,
        [name]: value
    };
};

schema.virtual("tokens", {
    ref: "UserToken",
    localField: "_id",
    foreignField: "user_id"
});

export interface UserType extends mongoose.Document {
    name:string,
    phone: string,
    username: string,
    email: string,
    password: string,
    two_factor_authentication: boolean;
    logged_in_at: Date;
    is_active: boolean;
    tokens: UserTokenType[]
    permissions: string[],
    active_status_updated_at: Date,
    meta: any,
    createdAt: Date,
    updatedAt: Date,

    createResetPasswordToken(): Promise<UserTokenType>

    createTwoFactorAuthToken(): Promise<UserTokenType>

    logoutFromAllDevices(): Promise<void>

    setMeta(key: string, value: any): void
}

schema.pre("save", function (this: UserType){
    if (!this.active_status_updated_at)
        this.active_status_updated_at = this.createdAt;

    if (this.phone && !this.phone.match(/^\+/))
        this.phone = "+" + this.phone;

    if (this.username)
        this.username = this.username.toLowerCase();

    if (this.email)
        this.email = this.email.toLowerCase();
});

export const User = mongoose.model<UserType>("User", schema);

