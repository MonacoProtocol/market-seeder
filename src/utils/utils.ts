import dotenv = require("dotenv");
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider, Program } from "@coral-xyz/anchor";
import { LOG_TYPE, log } from "./logging";

enum ENVS {
  DEVNET_RELEASE = "devnet-release",
  MAINNET_RELEASE = "mainnet-release"
}

type Config = {
  environment: string;
  name: string;
  protocol_address: string;
  anchor_wallet: string;
  anchor_provider: string;
  include_stake_in_returns: boolean;
  default_true_price: number,
  default_spread: number,
  default_steps: number,
  default_to_return: number,
  default_to_lose: number,
  default_depth_percentages: number[]
};

export function getConfig(): Config {
  const environment = process.env.ENVIRONMENT;
  const envConfig = { path: "./src/.env/.env" };
  switch (environment) {
    case ENVS.DEVNET_RELEASE:
      envConfig.path += `.${ENVS.DEVNET_RELEASE}`;
      dotenv.config(envConfig);
      break;
    case ENVS.MAINNET_RELEASE:
      envConfig.path += `.${ENVS.MAINNET_RELEASE}`;
      dotenv.config(envConfig);
      break;
    default:
      log(`⚠️  ENVIRONMENT env variable not set ⚠️\n\nSet with:`);
      Object.keys(ENVS).map((env) => log(`export ENVIRONMENT=${ENVS[env]}`));
      process.exit(1);
  }
  return {
    environment: process.env.ENVIRONMENT,
    name: process.env.CONFIG_NAME,
    protocol_address: process.env.PROTOCOL_ADDRESS,
    anchor_wallet: process.env.ANCHOR_WALLET,
    anchor_provider: process.env.ANCHOR_PROVIDER_URL,
    include_stake_in_returns: boolFromString(process.env.INCLUDE_STAKE_IN_RETURNS),
    default_true_price: parseFloat(process.env.DEFAULT_TRUE_PRICE),
    default_spread: parseFloat(process.env.DEFAULT_SPREAD),
    default_steps: parseFloat(process.env.DEFAULT_SEPS),
    default_to_return: parseFloat(process.env.DEFAULT_TO_RETURN),
    default_to_lose: parseFloat(process.env.DEFAULT_TO_LOSE),
    default_depth_percentages: floatListFromString(process.env.DEFAULT_DEPTH_PERCENTAGES)
  }
}

export async function getProgram() {
  const config = getConfig();
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = await Program.at(new PublicKey(config.protocol_address), provider);

  log(`Environment: ${config.environment}`);
  log(`RPC node: ${config.anchor_provider}`);
  log(`Wallet PublicKey: ${program.provider.publicKey}`);

  return program;
}

export function listFromString(stringList: string): string[] {
  return stringList.replace(/\s/g, "").split(",");
}

export function floatListFromString(stringList: string): number[] {
  const newList = stringList.replace(/\s/g, "").split(",");
  return newList.map((item) => parseFloat(item))
}

export function boolFromString(boolString: string): boolean {
  switch (true) {
    case boolString.toLowerCase() === "true":
      return true;
    case boolString.toLowerCase() === "false":
      return false;
    default:
      throw "Available boolean options: true, false";
  }
}

export function getProcessArgs(expectedArgs: string[], exampleInvocation: string): any{
  const defaultArgLength = 2
  if (process.argv.length != defaultArgLength+expectedArgs.length) {
    console.log(
      `Expected number of args: ${expectedArgs.length} ⚠️\n` +
      `Example invocation: ${exampleInvocation} ${expectedArgs.toString().replace(/,/g, ' ')}`
    );
    process.exit(1);
  }
  const namedArgs = process.argv.slice(-expectedArgs.length)
  let values = {}
  expectedArgs.map(function (arg, i){
    return values[expectedArgs[i]] = namedArgs[i]
  })
  log("Supplied arguments:")
  log(values, LOG_TYPE.JSON_STRINGIFY)
  return values
}

export function getTokenFromString(token: string): PublicKey{
  switch(true){
    case token === "wins":
      // Then Monaco Protocol Devnnet token
      return new PublicKey("Aqw6KyChFm2jwAFND3K29QjUcKZ3Pk72ePe5oMxomwMH")
    case token === "usdt":
      // Mainnet token
      return new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
    default:
      return new PublicKey(token)
  }
}
