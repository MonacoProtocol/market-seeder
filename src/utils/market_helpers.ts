import { PublicKey } from "@solana/web3.js";
import {
  getMarketOutcomeTitlesByMarket,
  getMarketAccountsByStatusAndMintAccount,
  MarketStatusFilter
} from "@monaco-protocol/client";
import { getProgram } from "./utils";
import { LOG_TYPE, log } from "./logging";

export type MarketOutcomeMapping = {
  marketPk: PublicKey;
  eventPk: PublicKey;
  marketTitle: string;
  marketType: string;
  outcome: string;
  outcomeIndex: number;
};

export async function getOpenMarketsOutcomeMappingByToken(token: PublicKey) {
  const program = await getProgram();
  const marketsResponse = await getMarketAccountsByStatusAndMintAccount(
    program,
    MarketStatusFilter.Open,
    token
  );
  marketsResponse.data.markets.sort((a, b) =>
    a.account.eventAccount.toString() > b.account.eventAccount.toString()
      ? 1
      : -1
  );
  const marketOutcomeMap = [] as MarketOutcomeMapping[];
  for (const market of marketsResponse.data.markets) {
    log(
      `Mapping outcomes for market: ${market.publicKey.toString()}`,
      LOG_TYPE.WAITING
    );
    const outcomes = await getMarketOutcomeTitlesByMarket(
      program,
      new PublicKey(market.publicKey)
    );
    outcomes.data.marketOutcomeTitles.map((outcome) => {
      marketOutcomeMap.push({
        marketPk: market.publicKey,
        eventPk: market.account.eventAccount,
        marketTitle: market.account.title,
        marketType: market.account.marketType,
        outcome: outcome,
        outcomeIndex: outcomes.data.marketOutcomeTitles.indexOf(outcome)
      });
    });
  }
  return marketOutcomeMap;
}
