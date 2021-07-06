import {Aggregate, Document, Model} from "mongoose";
import {get} from "lodash";
import escapeStringRegexp from "escape-string-regexp";
import {compareSync, hashSync} from "bcrypt";
import {stringify} from "csv-string";

export const titleCase = string => string ? ucWords(string.replace(/([_-])/g, " ")) : "";

export function encryptPassword (string: string){
    return hashSync(string, 4);
}

export function matchPasswords (encrypted: string, password: string){
    return compareSync(password, encrypted);
}

export const paginateAggregate = async <T extends Document>(aggregate: Aggregate<T[]>, {
    page = 1,
    limit = undefined
} = {}): Promise<[T[], number]> => {
    aggregate.match({});
    // @ts-ignore
    const model: Model<T> = aggregate.model();

    const total = get(await model.aggregate(aggregate.pipeline()).count("count").exec(), "0.count");

    if (limit){
        const offset = limit * (page - 1);
        aggregate.limit(limit + offset).skip(offset);
    }

    const models = await Promise.all<T>((await aggregate.exec()).map(async (data) => {
        return new model(data);
    }));

    return [models, total];
};

export const ucWords = string => string.toLowerCase().split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");

export const generateOtp = (length = 6) => {
    const number = Math.pow(10, length - 1);
    return String(Math.floor(number + Math.random() * 9 * number));
};

export function slugify (string){
    return string
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

export const generateCsv = ({
    dateFrom = "",
    dateTo = "",
    rows,
    headers,
    transform = undefined
}) => {
    const csvData = [];

    const dates = [];

    if(dateFrom){
        dates.push("Date From");
        dates.push(dateFrom);
    }

    if(dateTo){
        dates.push("Date To");
        dates.push(dateTo);
    }

    if(dates.length)
        csvData.push(dates);

    /*Append CSV Header*/
    csvData.push(headers);

    if (!rows.length)
        csvData.push(["No records found for selected criteria"]);

    if (transform)
        transform(csvData);

    /*Generate CSV string*/
    return stringify(csvData.concat(rows.map(row => row.map(value => {
        return value || "";
    }))));
};

export function matchCaseInsensitive (value){
    return {
        $regex: `^${escapeStringRegexp(value)}$`,
        $options: "i"
    };
}

export const currency = number => `$${Number(number).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;