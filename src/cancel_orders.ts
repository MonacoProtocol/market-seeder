import { cancelOrdersForMarket, getOrdersByMarketForProviderWallet } from "@monaco-protocol/client";
import { boolFromString, getProcessArgs, getProgram } from "./utils/utils";
import { PublicKey } from "@solana/web3.js";
import { LOG_TYPE, log } from "./utils/logging";

async function cancelOrders(marketPk: PublicKey, performAction: boolean){
    log(null, LOG_TYPE.CLEAR)
    const program = await getProgram()
    if (performAction){
        const cancelResponse = await cancelOrdersForMarket(program, marketPk)
        log(cancelResponse, LOG_TYPE.RESPONSE)
    }
    else {
        const orders = await getOrdersByMarketForProviderWallet(program, marketPk)
        if (orders.data.orderAccounts.length === 0){
            log(`No orders on market`, LOG_TYPE.INFO)
            process.exit()
        }
        const filteredOrders = orders.data.orderAccounts.filter((order) => order.account.stakeUnmatched.toNumber() > 0)
        filteredOrders.map((order) => {
            for (const [key,] of Object.entries(order.account)){
                // convert all BNs to numbers
                try {
                    order.account[key] = order.account[key].toNumber()
                }
                catch {
                    // do nothing
                }
            }
        })
        log(filteredOrders, LOG_TYPE.JSON_STRINGIFY)
    }
}

const processArgs = getProcessArgs(["marketPk", "performAction"], "npm run cancelOrders")
cancelOrders(new PublicKey(processArgs.marketPk), boolFromString(processArgs.performAction))
