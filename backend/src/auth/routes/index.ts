import { Application } from "express";
import envvars from "@/config/envvars";
import auth from "./auth.route";
import incident from "@/incident/routers/incident.route";

export const Routes = (app: Application): void => {
    const SERVICE_NAME = envvars.app.name;
    const BUILD_IDENTIFIER = envvars.app.build;

    // Service info endpoint
    app.get('/', (req, res) => {
        res.json({ service: `${SERVICE_NAME}`, version: BUILD_IDENTIFIER });
    });

    app.use('/api', auth);
    app.use('', incident);
};