import { Request, Response } from "express";
import { Builder, By, Capabilities } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { Industry } from "../enums/industry.js";
import APIError from "../apiError.js";
import { Stock } from "../models/stock.js";
import {
  indexStockRepository,
  readAllStocks,
  readStock,
  updateStockWithoutReindexing,
} from "../redis/repositories/stockRepository.js";
import { Size } from "../enums/size.js";
import { Style } from "../enums/style.js";
import chalk from "chalk";

class FetchController {
  getDriver() {
    const url = process.env.SELENIUM_URL || "http://selenium:4444";

    const capabilities = new Capabilities();
    capabilities.setBrowserName("chrome");
    capabilities.setPageLoadStrategy("eager");

    return new Builder()
      .usingServer(url)
      .withCapabilities(capabilities)
      .setChromeOptions(new Options().headless())
      .build();
  }

  async fetchMorningstarData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].morningstarId) {
          throw new APIError(
            404,
            `Stock ${ticker} does not have a Morningstar ID.`
          );
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks.filter((stock) => stock.morningstarId);
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    const updatedStocks: Stock[] = [];
    const driver = this.getDriver();
    for await (const stock of stocks) {
      let industry: Industry;
      let size: Size;
      let style: Style;
      let starRating: number;
      let dividendYieldPercent: number;
      let priceEarningRatio: number;

      try {
        await driver.get(
          `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${stock.morningstarId}&LanguageId=en-US&SecurityToken=${stock.morningstarId}]3]0]E0WWE$$ALL`
        );

        try {
          industry =
            Industry[
              (
                await driver
                  .findElement(
                    By.xpath(
                      "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.."
                    )
                  )
                  .getText()
              )
                .replace("Industry\n", "")
                .replaceAll(/[^a-zA-Z0-9]/g, "")
            ];
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract industry: ${e.message}`
            )
          );
        }

        try {
          const sizeAndStyle = (
            await driver
              .findElement(
                By.xpath(
                  "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/.."
                )
              )
              .getText()
          )
            .replace("Stock Style\n", "")
            .split("-");
          size = Size[sizeAndStyle[0]];
          style = Style[sizeAndStyle[1]];
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract size and style: ${e.message}`
            )
          );
        }

        try {
          starRating = +(
            await driver
              .findElement(By.xpath("//*/img[@class='starsImg']"))
              .getAttribute("alt")
          ).replaceAll(/\D/g, "");
          if (isNaN(starRating)) {
            starRating = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract star rating: ${e.message}`
            )
          );
        }

        try {
          dividendYieldPercent = +(await driver
            .findElement(By.id("Col0Yield"))
            .getText());
          if (isNaN(dividendYieldPercent)) {
            dividendYieldPercent = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract dividend yield: ${e.message}`
            )
          );
        }

        try {
          priceEarningRatio = +(await driver
            .findElement(By.id("Col0PE"))
            .getText());
          if (isNaN(priceEarningRatio)) {
            priceEarningRatio = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e.message}`
            )
          );
        }

        await updateStockWithoutReindexing(stock.ticker, {
          industry: industry,
          size: size,
          style: style,
          starRating: starRating,
          dividendYieldPercent: dividendYieldPercent,
          priceEarningRatio: priceEarningRatio,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch Morningstar information: ${e.message}`
          );
        }
        console.warn(
          chalk.yellowBright(
            `Stock ${stock.ticker}: Unable to fetch Morningstar information: ${e.message}`
          )
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      indexStockRepository();
      return res.status(200).json(updatedStocks);
    }
  }
}

export default new FetchController();