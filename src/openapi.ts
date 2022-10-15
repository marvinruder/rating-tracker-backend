import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "rating-tracker-backend",
    version: "0.1.0",
    contact: {
      name: "Marvin A. Ruder",
      email: "info@mruder.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    description: "Specification JSONs: [v3](/api-spec/v3).",
  },
  servers: [
    {
      url: "http://localhost:3001/",
      description: "Local server",
    },
    {
      url: "https://ratingtracker-snapshot.mruder.dev",
      description: "Snapshot server",
    },
    {
      url: "https://ratingtracker.mruder.dev",
      description: "Production server",
    },
  ],
  paths: {
    "/api/stock/list": {
      get: {
        operationId: "getStockList",
        summary: "Stock List API",
        description: "Get a list of stocks. Supports pagination.",
        parameters: [
          {
            in: "query",
            name: "offset",
            description: "The zero-based offset. Used for pagination.",
            required: false,
            schema: {
              type: "number",
              example: 0,
            },
          },
          {
            in: "query",
            name: "count",
            description:
              "The number of entities to be returned. If omitted, all entities known to the service will be returned (maximum: 10000).",
            required: false,
            schema: {
              type: "number",
              example: 5,
            },
          },
          {
            in: "query",
            name: "sortBy",
            description: "A parameter by which the stock list is to be sorted.",
            required: false,
            schema: {
              $ref: "#/components/schemas/SortableAttribute",
            },
          },
          {
            in: "query",
            name: "sortDesc",
            description: "Whether to sort descending.",
            required: false,
            schema: {
              type: "boolean",
            },
          },
          {
            in: "query",
            name: "name",
            description:
              "A string to be searched for in the name of the stock(s).",
            required: false,
            schema: {
              type: "string",
              example: "App",
            },
          },
          {
            in: "query",
            name: "country",
            description: "A list of countries used for searching.",
            required: false,
            explode: false,
            allowReserved: true,
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Country",
              },
            },
          },
          {
            in: "query",
            name: "industry",
            description: "A list of industries used for searching.",
            required: false,
            explode: false,
            allowReserved: true,
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Industry",
              },
            },
          },
          {
            in: "query",
            name: "size",
            description: "A list of sizes used for searching.",
            required: false,
            schema: {
              $ref: "#/components/schemas/Size",
            },
          },
          {
            in: "query",
            name: "style",
            description: "A list of styles used for searching.",
            required: false,
            schema: {
              $ref: "#/components/schemas/Style",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StockListWithCount",
                },
              },
            },
          },
        },
      },
    },
    "/api/stock/fillWithExampleData": {
      put: {
        operationId: "putExampleStocks",
        summary: "Stock Example Data API",
        description: "Fills the connected data service with example stocks",
        responses: {
          "201": {
            description: "Created",
            content: {},
          },
        },
      },
    },
    "/api/stock/{ticker}": {
      delete: {
        operationId: "deleteStock",
        summary: "Delete Stock API",
        description: "Delete the specified stock",
        parameters: [
          {
            in: "path",
            name: "ticker",
            description: "The ticker symbol of the stock to be deleted.",
            required: true,
            schema: {
              type: "string",
              example: "AAPL",
            },
          },
        ],
        responses: {
          "204": {
            description: "No Content",
            content: {},
          },
          "404": {
            description: "Stock not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/fetch/morningstar": {
      get: {
        operationId: "fetchMorningstarData",
        summary: "Morningstar Fetch API",
        description: "Fetch information from Morningstar UK web page",
        parameters: [
          {
            in: "query",
            name: "ticker",
            description:
              "The ticker of the stock for which information is to be fetched. If not present, all stocks known to the system will be used",
            required: false,
            schema: {
              type: "string",
              example: "AAPL",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Stock",
                  },
                },
              },
            },
          },
          "204": {
            description: "No Content",
            content: {},
          },
          "404": {
            description: "Stock not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "502": {
            description: "Unable to fetch",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [],
  components: {
    schemas: {
      Country: {
        type: "string",
        description:
          "The 2-letter ISO 3166-1 country code of the country the stock is based in.",
        enum: [
          "AF",
          "AX",
          "AL",
          "DZ",
          "AS",
          "AD",
          "AO",
          "AI",
          "AG",
          "AR",
          "AM",
          "AW",
          "AU",
          "AT",
          "AZ",
          "BS",
          "BH",
          "BD",
          "BB",
          "BY",
          "BE",
          "BZ",
          "BJ",
          "BM",
          "BT",
          "BO",
          "BQ",
          "BA",
          "BW",
          "BV",
          "BR",
          "IO",
          "BN",
          "BG",
          "BF",
          "BI",
          "CV",
          "KH",
          "CM",
          "CA",
          "KY",
          "CF",
          "TD",
          "CL",
          "CN",
          "CX",
          "CC",
          "CO",
          "KM",
          "CG",
          "CD",
          "CK",
          "CR",
          "CI",
          "HR",
          "CU",
          "CW",
          "CY",
          "CZ",
          "DK",
          "DJ",
          "DM",
          "DO",
          "EC",
          "EG",
          "SV",
          "GQ",
          "ER",
          "EE",
          "SZ",
          "ET",
          "FK",
          "FO",
          "FJ",
          "FI",
          "FR",
          "GF",
          "PF",
          "TF",
          "GA",
          "GM",
          "GE",
          "DE",
          "GH",
          "GI",
          "GR",
          "GL",
          "GD",
          "GP",
          "GU",
          "GT",
          "GG",
          "GN",
          "GW",
          "GY",
          "HT",
          "HM",
          "VA",
          "HN",
          "HK",
          "HU",
          "IS",
          "IN",
          "ID",
          "IR",
          "IQ",
          "IE",
          "IM",
          "IL",
          "IT",
          "JM",
          "JP",
          "JE",
          "JO",
          "KZ",
          "KE",
          "KI",
          "KR",
          "KP",
          "KW",
          "KG",
          "LA",
          "LV",
          "LB",
          "LS",
          "LR",
          "LY",
          "LI",
          "LT",
          "LU",
          "MO",
          "MG",
          "MW",
          "MY",
          "MV",
          "ML",
          "MT",
          "MH",
          "MQ",
          "MR",
          "MU",
          "YT",
          "MX",
          "FM",
          "MD",
          "MC",
          "MN",
          "ME",
          "MS",
          "MA",
          "MZ",
          "MM",
          "NA",
          "NR",
          "NP",
          "NL",
          "NC",
          "NZ",
          "NI",
          "NE",
          "NG",
          "NU",
          "NF",
          "MK",
          "MP",
          "NO",
          "OM",
          "PK",
          "PW",
          "PS",
          "PA",
          "PG",
          "PY",
          "PE",
          "PH",
          "PN",
          "PL",
          "PT",
          "PR",
          "QA",
          "RE",
          "RO",
          "RU",
          "RW",
          "BL",
          "SH",
          "KN",
          "LC",
          "MF",
          "PM",
          "VC",
          "WS",
          "SM",
          "ST",
          "SA",
          "SN",
          "RS",
          "SC",
          "SL",
          "SG",
          "SX",
          "SK",
          "SI",
          "SB",
          "SO",
          "ZA",
          "GS",
          "SS",
          "ES",
          "LK",
          "SD",
          "SR",
          "SJ",
          "SE",
          "CH",
          "SY",
          "TW",
          "TJ",
          "TZ",
          "TH",
          "TL",
          "TG",
          "TK",
          "TO",
          "TT",
          "TN",
          "TR",
          "TM",
          "TC",
          "TV",
          "UG",
          "UA",
          "AE",
          "GB",
          "US",
          "UM",
          "UY",
          "UZ",
          "VU",
          "VE",
          "VN",
          "VG",
          "VI",
          "WF",
          "EH",
          "YE",
          "ZM",
          "ZW",
        ],
        example: "US",
      },
      Industry: {
        type: "string",
        description: "The main industry the company operates in.",
        enum: [
          "AgriculturalInputs",
          "BuildingMaterials",
          "Chemicals",
          "SpecialtyChemicals",
          "LumberWoodProduction",
          "PaperProducts",
          "Aluminum",
          "Copper",
          "OtherIndustrialMetalsMining",
          "Gold",
          "Silver",
          "OtherPreciousMetalsMining",
          "CokingCoal",
          "Steel",
          "AutoTruckDealerships",
          "AutoManufacturers",
          "AutoParts",
          "RecreationalVehicles",
          "FurnishingsFixturesAppliances",
          "ResidentialConstruction",
          "TextileManufacturing",
          "ApparelManufacturing",
          "FootwearAccessories",
          "PackagingContainers",
          "PersonalServices",
          "Restaurants",
          "ApparelRetail",
          "DepartmentStores",
          "HomeImprovementRetail",
          "LuxuryGoods",
          "InternetRetail",
          "SpecialtyRetail",
          "Gambling",
          "Leisure",
          "Lodging",
          "ResortsCasinos",
          "TravelServices",
          "AssetManagement",
          "BanksDiversified",
          "BanksRegional",
          "MortgageFinance",
          "CapitalMarkets",
          "FinancialDataStockExchanges",
          "InsuranceLife",
          "InsurancePropertyCasualty",
          "InsuranceReinsurance",
          "InsuranceSpecialty",
          "InsuranceBrokers",
          "InsuranceDiversified",
          "ShellCompanies",
          "FinancialConglomerates",
          "CreditServices",
          "RealEstateDevelopment",
          "RealEstateServices",
          "RealEstateDiversified",
          "REITHealthcareFacilities",
          "REITHotelMotel",
          "REITIndustrial",
          "REITOffice",
          "REITResidential",
          "REITRetail",
          "REITMortgage",
          "REITSpecialty",
          "REITDiversified",
          "BeveragesBrewers",
          "BeveragesWineriesDistilleries",
          "BeveragesNonAlcoholic",
          "Confectioners",
          "FarmProducts",
          "HouseholdPersonalProducts",
          "PackagedFoods",
          "EducationTrainingServices",
          "DiscountStores",
          "FoodDistribution",
          "GroceryStores",
          "Tobacco",
          "Biotechnology",
          "DrugManufacturersGeneral",
          "DrugManufacturersSpecialtyGeneric",
          "HealthcarePlans",
          "MedicalCareFacilities",
          "PharmaceuticalRetailers",
          "HealthInformationServices",
          "MedicalDevices",
          "MedicalInstrumentsSupplies",
          "DiagnosticsResearch",
          "MedicalDistribution",
          "UtilitiesIndependentPowerProducers",
          "UtilitiesRenewable",
          "UtilitiesRegulatedWater",
          "UtilitiesRegulatedElectric",
          "UtilitiesRegulatedGas",
          "UtilitiesDiversified",
          "TelecomServices",
          "AdvertisingAgencies",
          "Publishing",
          "Broadcasting",
          "Entertainment",
          "InternetContentInformation",
          "ElectronicGamingMultimedia",
          "OilGasDrilling",
          "OilGasEP",
          "OilGasIntegrated",
          "OilGasMidstream",
          "OilGasRefiningMarketing",
          "OilGasEquipmentServices",
          "ThermalCoal",
          "Uranium",
          "AerospaceDefense",
          "SpecialtyBusinessServices",
          "ConsultingServices",
          "RentalLeasingServices",
          "SecurityProtectionServices",
          "StaffingEmploymentServices",
          "Conglomerates",
          "EngineeringConstruction",
          "InfrastructureOperations",
          "BuildingProductsEquipment",
          "FarmHeavyConstructionMachinery",
          "IndustrialDistribution",
          "BusinessEquipmentSupplies",
          "SpecialtyIndustrialMachinery",
          "MetalFabrication",
          "PollutionTreatmentControls",
          "ToolsAccessories",
          "ElectricalEquipmentParts",
          "AirportsAirServices",
          "Airlines",
          "Railroads",
          "MarineShipping",
          "Trucking",
          "IntegratedFreightLogistics",
          "WasteManagement",
          "InformationTechnologyServices",
          "SoftwareApplication",
          "SoftwareInfrastructure",
          "CommunicationEquipment",
          "ComputerHardware",
          "ConsumerElectronics",
          "ElectronicComponents",
          "ElectronicsComputerDistribution",
          "ScientificTechnicalInstruments",
          "SemiconductorEquipmentMaterials",
          "Semiconductors",
          "Solar",
        ],
        example: "ConsumerElectronics",
      },
      Size: {
        type: "string",
        description: "The size of the company.",
        enum: ["Large", "Mid", "Small"],
        example: "Large",
      },
      Style: {
        type: "string",
        description: "The style of the stock.",
        enum: ["Value", "Blend", "Growth"],
        example: "Growth",
      },
      Stock: {
        type: "object",
        description: "A stock.",
        properties: {
          ticker: {
            type: "string",
            example: "AAPL",
          },
          name: {
            type: "string",
            example: "Apple Inc.",
          },
          country: {
            $ref: "#/components/schemas/Country",
          },
          industry: {
            $ref: "#/components/schemas/Industry",
          },
          size: {
            $ref: "#/components/schemas/Size",
          },
          style: {
            $ref: "#/components/schemas/Style",
          },
        },
        required: ["ticker", "name"],
      },
      SortableAttribute: {
        type: "string",
        description: "The name of an attribute whose values can be sorted.",
        enum: [
          "name",
          "size",
          "style",
          "starRating",
          "dividendYieldPercent",
          "priceEarningRatio",
        ],
        example: "name",
      },
      StockListWithCount: {
        type: "object",
        description:
          "A stock list accompanied with the total number of available stocks",
        properties: {
          stocks: {
            type: "array",
            description: "The list of requested stocks.",
            items: {
              $ref: "#/components/schemas/Stock",
            },
          },
          count: {
            type: "number",
            description: "The total number of available stocks.",
          },
        },
        required: ["stocks", "count"],
      },
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          errors: {
            type: "string",
          },
        },
        required: ["message"],
      },
    },
  },
};

export default openapiDocument;
