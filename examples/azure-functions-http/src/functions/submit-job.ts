import { app } from "@azure/functions";
import { submitJobOptions } from "./submit-job-registration.js";

app.http("submitJob", submitJobOptions);
