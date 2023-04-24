import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import { CsvFile, csvHeaders } from "./utils/csv_manager";
import { boolFromString, floatListFromString, getConfig, getProcessArgs, getProgram } from "./utils/utils";
import { LOG_TYPE, log } from "./utils/logging";
import { SeedManager } from "@monaco-protocol/seed-calculator";
import { createOrderUiStake } from "@monaco-protocol/client";

async function seedFromCsv(csvName: string, performAction: boolean){
    log(null, LOG_TYPE.CLEAR)
    const config = getConfig()
    const program = await getProgram()
    const data = new CsvFile(
        {
            path: path.resolve(__dirname, "csvs/", csvName),
            headers: csvHeaders
        }
    )
    const outcomes = await data.read()
    log(`Loaded ${csvName}.csv ✅`)
    log(`Markets and outcomes from csv:`)
    outcomes.map((marketOutcome)=> {
        const marketPk = new PublicKey(marketOutcome.marketPk)
        const seedManager = SeedManager.initialize(parseFloat(marketOutcome.truePrice), parseFloat(marketOutcome.spread), parseFloat(marketOutcome.steps), parseFloat(marketOutcome.toReturn), parseFloat(marketOutcome.toLose), config.include_stake_in_returns, floatListFromString(marketOutcome.depthPercentages))
        if (marketOutcome.seed === "TRUE"){
            log(`Market ${marketOutcome.marketPk} | Outcome: ${marketOutcome.outcome} | Title: ${marketOutcome.marketTitle}`, LOG_TYPE.INFO)
            log(`FOR`)
            log(seedManager.forSeeds, LOG_TYPE.JSON)
            log(`AGAINST`)
            log(seedManager.againstSeeds, LOG_TYPE.JSON)
            if (performAction){
                seedManager.forSeeds.map(async (seed) => {
                    const seeding = await createOrderUiStake(program, marketPk, marketOutcome.outcomeIndex, true, seed.price, seed.stake)
                    log(seeding, LOG_TYPE.RESPONSE)
                })
                seedManager.againstSeeds.map(async (seed) => {
                    const seeding = await createOrderUiStake(program, marketPk, marketOutcome.outcomeIndex, false, seed.price, seed.stake)
                    log(seeding, LOG_TYPE.RESPONSE)                    
                })
            }
        }
    })
}

const processArgs = getProcessArgs(["csvName", "performAction"], "npm run seedFromCsv")
seedFromCsv(processArgs.csvName, boolFromString(processArgs.performAction))
