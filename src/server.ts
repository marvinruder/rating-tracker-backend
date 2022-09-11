import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import MainRouter from "./routers/Router";
import SwaggerUI from "swagger-ui-express";
import swaggerDocument from "./openapi.json";
import * as OpenApiValidator from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { getStockRepository } from "./redis/repositories/stockRepository";
import chalk from "chalk";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((req, res, next) => {
  console.log(
    chalk.blue(
      new Date().toISOString(),
      req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      req.headers.host,
      highlightMethod(req.method),
      req.url,
      JSON.stringify(req.params)
    )
  );
  next();
});

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));
server.app.get("/api-spec/v3", (req, res) => res.json(swaggerDocument));

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDocument as unknown as OpenAPIV3.Document,
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

getStockRepository();
