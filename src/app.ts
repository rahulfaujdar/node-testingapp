import express from "express";
import * as os from "os";
import {postTrimmer} from "./helpers/validations";
import useragent from "express-useragent";
import fileUpload from "express-fileupload";
import cors from "cors";

export const app = express();

app.get("/", (req, res) => {
    res.send("Welcome in node application");
});

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
    preserveExtension: true,
    parseNested: true
}));

app.use((req, res, next) => {
    req.body = {
        ...req.body,
        // @ts-ignore
        ...req.files
    };
    next();
});

app.use(express.json());

app.use(useragent.express());

app.use(postTrimmer);

app.use(cors());
