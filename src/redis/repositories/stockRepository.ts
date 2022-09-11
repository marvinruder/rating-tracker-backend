import { Repository } from "redis-om";
import APIError from "src/apiError";
import { Stock, StockEntity, stockSchema } from "src/models/stock";
import client from "../Client";
import chalk from "chalk";

let stockRepository: Repository<StockEntity>;

export const getStockRepository = async () => {
  if (!stockRepository) {
    console.log(
      chalk.grey(
        "Using Stock Repository for the first time, fetching and indexing."
      )
    );
    stockRepository = (await client()).fetchRepository(stockSchema);
    await stockRepository.createIndex();
    console.log(chalk.grey("Stock Repository is now fetched and indexed."));
  }
  return stockRepository;
};

export const reindexStockRepository = async () => {
  stockRepository = (await client()).fetchRepository(stockSchema);
  await stockRepository.createIndex();
  console.log(chalk.grey("Stock Repository is now freshly indexed."));
};

export const createStockWithoutReindexing = async (stock: Stock) => {
  let entityID;
  try {
    entityID = await stockRepository
      .search()
      .where("ticker")
      .equals(stock.ticker)
      .firstId();
  } catch (e) {
    entityID = undefined;
  }
  if (entityID) {
    console.warn(
      chalk.yellowBright(
        `Skipping stock “${stock.name}” – existing already (entity ID ${entityID}).`
      )
    );
  } else {
    console.log(
      chalk.greenBright(
        `Created stock “${stock.name}” with entity ID ${
          (await stockRepository.createAndSave(Stock.toJSON(stock))).entityId
        }.`
      )
    );
  }
};

export const createStock = async (stock: Stock) => {
  await createStockWithoutReindexing(stock);
  reindexStockRepository();
};

export const readStock = async (entityID: string) => {
  return await readStocks([entityID]);
};

export const readStocks = async (entityIDs: string[]) => {
  return (await stockRepository.fetch(entityIDs)).map((stockEntity) => {
    const stock = new Stock(stockEntity);
    if (stock.ticker) {
      return stock;
    }
    throw new APIError(404, `Stock Entity ${stockEntity.entityId} not found.`);
  });
};

export const readAllStocks = async () => {
  return await stockRepository.search().allIds();
};

export const deleteStockWithoutReindexing = async (entityID: string) => {
  const stockEntity = await stockRepository.fetch(entityID);
  const stock = new Stock(stockEntity);
  if (stock.ticker) {
    await stockRepository.remove(entityID);
    console.log(
      chalk.greenBright(
        `Deleted stock “${stock.name}” with entity ID ${entityID}.`
      )
    );
  } else {
    throw new APIError(404, `Stock Entity ${entityID} not found.`);
  }
};

export const deleteStock = async (entityID: string) => {
  await deleteStockWithoutReindexing(entityID);
  reindexStockRepository();
};
