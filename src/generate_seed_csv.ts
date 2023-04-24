import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import { CsvFile, csvHeaders } from "./utils/csv_manager";
import { MarketOutcomeMapping, getOpenMarketsOutcomeMappingByToken } from "./utils/market_helpers";
import { getConfig, getProcessArgs, getTokenFromString } from "./utils/utils";
import { LOG_TYPE, log } from "./utils/logging";

export type CsvMapping = MarketOutcomeMapping & {
    truePrice: number,
    spread: number,
    steps: number,
    toReturn: number,
    toLose: number,
    depthPercentages: number[],
    seed: string
}

async function generateCsv(csvName: string, token: PublicKey){
    const config = getConfig()
    const csvFile = new CsvFile(
        {
            path: path.resolve(__dirname, "csvs/", csvName),
            headers: csvHeaders
        }
    )
    const openMarkets = await getOpenMarketsOutcomeMappingByToken(token)
    const csvFields = openMarkets.map((market) => {
        return {
            ...market,
            truePrice: config.default_true_price,
            spread: config.default_spread,
            steps: config.default_steps,
            toReturn: config.default_to_return,
            toLose: config.default_to_lose,
            depthPercentages: config.default_depth_percentages,
            seed: "FALSE"
        } as CsvMapping
    })
    csvFile.update(csvFields)
    log(`Done`, LOG_TYPE.DONE)
}

const processArgs = getProcessArgs(["csvName", "token"], "npm run generateSeedCsv")
const csvName = processArgs.csvName
const token = getTokenFromString(processArgs.token)
generateCsv(csvName, token)
