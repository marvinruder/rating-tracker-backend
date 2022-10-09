import APIError from "../../apiError.js";
import { Stock, stockSchema } from "../../models/stock.js";
import client from "../Client.js";
import chalk from "chalk";
import { Country } from "../../enums/country.js";
import { Industry } from "../../enums/industry.js";
import { Size } from "../../enums/size.js";
import { Style } from "../../enums/style.js";

console.log(
  chalk.grey(
    "Using Stock Repository for the first time, fetching and indexing."
  )
);
export const stockRepository = client.fetchRepository(stockSchema);
await stockRepository.createIndex();
console.log(
  chalk.grey(
    `Stock Repository is now fetched and indexed (${await stockRepository
      .search()
      .count()} stocks available).`
  )
);

export const indexStockRepository = async () => {
  await stockRepository.createIndex();
  console.log(
    chalk.grey(
      `Stock Repository is now freshly indexed (${await stockRepository
        .search()
        .count()} stocks available).`
    )
  );
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
  indexStockRepository();
};

export const readStock = async (ticker: string) => {
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    return new Stock(stockEntity);
  } else {
    throw new APIError(404, `Stock with ticker ${ticker} not found.`);
  }
};

export const readAllStocks = async () => {
  return await stockRepository.search().return.all();
};

export const readStockCount = async () => {
  return await stockRepository.search().count();
};

export const updateStock = async (
  ticker: string,
  updatedValues: {
    country?: Country;
    industry?: Industry;
    size?: Size;
    style?: Style;
    morningstarId?: string;
  }
) => {
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    stockEntity.country = updatedValues.country ?? null;
    stockEntity.industry = updatedValues.industry ?? null;
    stockEntity.size = updatedValues.size ?? null;
    stockEntity.style = updatedValues.style ?? null;
    stockEntity.morningstarId = updatedValues.morningstarId ?? null;
    await stockRepository.save(stockEntity);
  } else {
    throw new APIError(404, `Stock with ticker ${ticker} not found.`);
  }
};

export const deleteStockWithoutReindexing = async (ticker: string) => {
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    const name = new Stock(stockEntity).name;
    await stockRepository.remove(stockEntity.entityId);
    console.log(
      chalk.greenBright(`Deleted stock “${name}” (ticker ${ticker}).`)
    );
  } else {
    throw new APIError(404, `Stock with ticker ${ticker} not found.`);
  }
};

export const deleteStock = async (ticker: string) => {
  await deleteStockWithoutReindexing(ticker);
  indexStockRepository();
};
