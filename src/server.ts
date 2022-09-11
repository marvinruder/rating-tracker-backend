import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import MainRouter from "./routers/Router.js";
import SwaggerUI from "swagger-ui-express";
import openapiDocument from "./openapi.js";
import * as OpenApiValidator from "express-openapi-validator";
import chalk from "chalk";
import responseTime from "response-time";
import { STATUS_CODES } from "http";

dotenv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

class Server {
  public app = express();
  public router = MainRouter;
}

const server = new Server();

const highlightMethod = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.bgBlue(method);

    case "POST":
      return chalk.bgGreen(method);

    case "PUT":
      return chalk.bgYellow(method);

    case "DELETE":
      return chalk.bgRed(method);

    default:
      return method;
  }
};

const statusCodeDescription = (statusCode: number) => {
  const statusCodeString = `${statusCode} ${STATUS_CODES[statusCode]}`;
  switch (Math.floor(statusCode / 100)) {
    case 2:
      return chalk.bgGreen(statusCodeString);

    case 1:
    case 3:
      return chalk.bgYellow(statusCodeString);

    case 4:
    case 5:
      return chalk.bgRed(statusCodeString);
  }
  return statusCodeString;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use(
  responseTime((req, res, time) => {
    console.log(
      chalk.blue(
        new Date().toISOString(),
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        req.headers.host,
        highlightMethod(req.method),
        req.url,
        JSON.stringify(req.params),
        " – ",
        statusCodeDescription(res.statusCode),
        `after ${Math.round(time)} ms`
      )
    );
  })
);

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(openapiDocument));
server.app.get("/api-spec/v3", (req, res) => res.json(openapiDocument));

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: openapiDocument,
    validateRequests: true,
    validateResponses: true,
  })
);

server.app.use("/api", cors(), server.router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((err, req, res, next) => {
  console.error(
    chalk.redBright(`Terminating with error code ${err.status}: ${err.message}`)
  );
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

server.app.listen(PORT, () =>
  console.log(chalk.green(`> Listening on port ${PORT}`))
);
