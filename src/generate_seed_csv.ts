import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import { CsvFile, csvHeaders } from "./csv_manager";
import { getOpenMarketsOutcomeMappingByToken } from "./market_helpers";
import { getProcessArgs, getTokenFromString, log } from "./utils";

async function generateCsv(csvName: string, token: PublicKey){
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
            forMidpoint: 1.001,
            forStakes: "100, 50",
            againstMidpoint: 1.001,
            againstStakes: "100, 50",
            seed: "FALSE"
        }
    })
    csvFile.update(csvFields)
    log(`Done ✅`)
}

const processArgs = getProcessArgs(["csvName", "token"], "npm run generateSeedCsv")
const csvName = processArgs.csvName
const token = getTokenFromString(processArgs.token)
generateCsv(csvName, token)
