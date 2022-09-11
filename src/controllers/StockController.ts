import { Request, Response } from "express";
import exampleStocks from "../exampleStocks.js";
import {
  createStockWithoutReindexing,
  deleteStock,
  readAllStocks,
  readStocks,
  indexStockRepository,
} from "../redis/repositories/stockRepository.js";

class StockController {
  async getList(res: Response) {
    return res.status(200).json(await readAllStocks());
  }

  async getDetails(req: Request, res: Response) {
    return res.status(200).json(await readStocks(req.params[0].split(",")));
  }

  async fillWithExampleData(res: Response) {
    for (const stock of exampleStocks) {
      await createStockWithoutReindexing(stock);
    }
    indexStockRepository();
    return res.status(201).end();
  }

  async delete(req: Request, res: Response) {
    await deleteStock(req.params[0]);
    return res.status(204).end();
  }
}

export default new StockController();
