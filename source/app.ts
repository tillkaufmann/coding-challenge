import { Server } from "http";
import {
  Configuration,
  readAppConfiguration,
} from "./models/ConfigurationModel.js";
import createApp from "./server.js";

const configurationFile = "app.conf.json";

const configuration: Configuration = readAppConfiguration(configurationFile);

const server: Server = createApp(configuration).app.listen(
  configuration.port,
  () => {
      console.log(`Listening on http://localhost:${configuration.port}`);
  }
);

const opts = configuration.expressServerOptions ?? {};

server.keepAliveTimeout = opts.keepAliveTimeout ?? 5000; // ms
server.maxHeadersCount = opts.maxHeadersCount ?? 100;
server.maxConnections = opts.maxConnections ?? 100;
server.headersTimeout = opts.headersTimeout ?? 5000; // ms
server.requestTimeout = opts.requestTimeout ?? 5000; // ms
server.timeout = opts.timeout ?? 2000; //