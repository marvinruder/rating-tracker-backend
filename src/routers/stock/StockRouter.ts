import { Request, Response, Router } from "express";
import StockController from "src/controllers/StockController";
import "express-async-errors";

class StockRouter {
  private _router = Router();
  private _controller = StockController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.get("/details/*", async (req: Request, res: Response) => {
      await this._controller.getDetails(req, res);
    });
    this._router.get("/list", async (req: Request, res: Response) => {
      await this._controller.getList(res);
    });
    this._router.put(
      "/fillWithExampleData",
      async (req: Request, res: Response) => {
        await this._controller.fillWithExampleData(res);
      }
    );
    this._router.delete("/*", async (req: Request, res: Response) => {
      await this._controller.delete(req, res);
    });
  }
}

export default new StockRouter().router;
