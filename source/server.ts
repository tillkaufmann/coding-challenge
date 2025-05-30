import express, { Express, Router, json } from "express";
import responseTime from "response-time";
import Helmet from "helmet";
import { Configuration } from "./models/ConfigurationModel.js";
import ValidateRouter from "./routers/ValidateRouter.js";

export default function createApp(configuration: Configuration): {
  app: Express;
  router: Router;
} {
  const app: Express = express();

  app.use((req, res, next) => {
    const log = () => {
      console.log(`incoming request: ${req.method} ${req.url} -> ${res.statusCode}`);
    };
    res.on("finish", log);
    res.on("close", log);
    next();
  });

  app.use(Helmet());
  app.use(json());

  app.use(responseTime({ suffix: true }));

  const router = ValidateRouter(configuration);
  app.use("/", router);
  return { app, router };
}
