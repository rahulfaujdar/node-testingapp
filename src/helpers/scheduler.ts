import * as cron from "node-cron";
import {scheduleTime} from "../constants";

export const runScheduler = async () => {
    cron.schedule(scheduleTime, () => {
        console.log("\n---------------\nrunScheduler\n-----------------");
    });
};
