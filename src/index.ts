require("dotenv").config();
import {connectTestDb} from "./database/db";
import "url-search-params-polyfill";
import {error} from "./helpers/response";
import {app} from "./app";
import "moment-timezone";
import {HOST, PORT} from "./constants";
import {runScheduler} from "./helpers/scheduler";
import requireDir from "require-dir";
import moment from "moment";

global.fetch = require("node-fetch");
global.navigator = () => null;
global.moment = moment;

requireDir("./controllers");
requireDir("./models");
requireDir("./routes");

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next){
    res.json(error(err.message));
});

app.listen(Number(PORT), HOST, () => {
        console.log(`listening on ${HOST}:${PORT}`);
    });

// Promise.all([connectTestDb()]).then(() => {
//     app.listen(Number(PORT), HOST, () => {
//         console.log(`listening on ${HOST}:${PORT}`);
//     });
//     // noinspection JSIgnoredPromiseFromCall
//     runScheduler();
// });

