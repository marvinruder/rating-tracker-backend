import { Request, Response } from "express";
import { Builder, By, Capabilities } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { Industry } from "../enums/industry.js";
import APIError from "../apiError.js";
import { Stock } from "../models/stock.js";
import {
  readAllStocks,
  readStock,
} from "../redis/repositories/stockRepository.js";

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
            `Stock with ticker ${ticker} does not have a Morningstar ID.`
          );
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    const driver = this.getDriver();

    try {
      stocks = stocks.filter((stock) => stock.morningstarId);
      for await (const stock of stocks) {
        await driver.get(
          `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${stock.morningstarId}&LanguageId=en-US&SecurityToken=${stock.morningstarId}]3]0]E0WWE$$ALL`
        );

        const industry = (
          await driver
            .findElement(
              By.xpath(
                "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.."
              )
            )
            .getText()
        ).replace("Industry\n", "") as Industry;

        const starRating = (
          await driver
            .findElement(By.xpath("//*/img[@class='starsImg']"))
            .getAttribute("alt")
        ).replaceAll(/\D/g, "");
      }
    } finally {
      await driver.quit();
    }

    return res.status(204).end();
  }
}

export default new FetchController();
