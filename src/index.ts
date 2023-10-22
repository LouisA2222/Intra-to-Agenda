import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
import * as fs from "fs";
import createEvent from "./modules/createEvent.js";
import sendEventByEmail from "./modules/sendEmail.js";
import { ICalEvent, ICalEventData } from "ical-generator";
dotenv.config();

const cookie  = process.env.COOKIE;
let availableCredits = 0;

axios.defaults.headers.common["Cookie"] = "user=" + cookie;

// axios.get("https://intra.epitech.eu/course/filter/?format=json").then((res) => {
//     res.data.forEach((element: any) => {
//         if (element.status === "ongoing") {
//             console.log("["+ chalk.green(element.code + "]") + " " + chalk.yellow(element.title));
//             availableCredits += parseInt(element.credits);
//         } else  {
//             console.log("["+ chalk.red(element.code + "]") + " " + chalk.yellow(element.title));
//         }
//     });
//     // console.log("Total credits available: " + chalk.green(availableCredits));
// });

async function getPlanning(from: Date, to: Date, location: string) {
    const startDate = from.toISOString().slice(0, 10);
    const endDate = to.toISOString().slice(0, 10);
    const res = await axios.get("https://intra.epitech.eu/planning/load?format=json&start=" + startDate + "&end=" + endDate);
    const planning = res.data;
    let result:Array<Object> = [];
    planning.forEach((element: any) => {
        if (element.instance_location === location && element.event_registered == 'registered') {
            result.push(element);
        }
    });
    return result;
}

async function savePlanning(planning: Array<Object>) {
    fs.writeFileSync("data/planning.json", JSON.stringify(planning));
}

async function getSavedPlanning() {
    try {
        const data = fs.readFileSync("data/planning.json");
        return JSON.parse(data.toString());
    } catch (e) {
        return [];
    }
}

async function getNewPlanning() {
    const planning = await getPlanning(new Date(Date.now()), new Date(Date.now() + 604800000), "FR/LIL");
    const savedPlanning = await getSavedPlanning();
    let newPlanning:Array<Object> = [];
    planning.forEach((element: any) => {
        let found = false;
        savedPlanning.forEach((savedElement: any) => {
            if (element.acti_title === savedElement.acti_title) {
                found = true;
            }
        });
        if (!found) {
            newPlanning.push(element);
        }
    });
    return newPlanning;
}

async function main() {
    // const planning = await getPlanning(new Date(Date.now()), new Date(Date.now() + 604800000), "FR/LIL");
    const planning = await getNewPlanning();
    const toSave = await getPlanning(new Date(Date.now()), new Date(Date.now() + 604800000), "FR/LIL");
    await savePlanning(toSave);
    console.log(planning);
    planning.forEach(async (element: any) => {
        const title = "["+ element.codemodule + "] " + element.acti_title  || "No title";
        const location = element.room.code || "No location";
        let event : ICalEventData = {
            start: new Date(element.start),
            end: new Date(element.end),
            summary: title,
            description: element.titlemodule + " - " + element.codeacti,
            location: location,
        };
        const toSend = await createEvent(event, "Epitech", "Europe/Paris");
        await sendEventByEmail(toSend, process.env.RECEIVER_EMAIL || "");
    });
}

main();