import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider, Program } from "@project-serum/anchor";
import { ProtocolAddresses, ClientResponse } from "@monaco-protocol/client";

export async function getProgram() {
  const provider = AnchorProvider.env();
  setProvider(provider);
  const protocolAddress = new PublicKey(ProtocolAddresses.DEVNET_STABLE)

  return Program.at(protocolAddress, provider);
}

function logString(msg: string): string {
  return `${new Date().toISOString()} - [${process.pid}] - ${msg}`;
}

export function log(msg: any, ...args: unknown[]) {
  if (args.length == 0) console.log(logString(msg));
  else console.log(logString(msg), args);
}

export function logOk(){
  log("Ok ✅")
}

export function logJson(json: object){
  log(JSON.stringify(json, null, 2))
}

export function logResponse(response: ClientResponse<{}>){
  if (!response.success){
      log(response.errors)
  }
  else{
      logJson(response)
  }
}

export function listFromString(stringList: string): string[] {
  return stringList.replace(/\s/g, "").split(",");
}

export function floatListFromString(stringList: string): number[] {
  const newList = stringList.replace(/\s/g, "").split(",");
  return newList.map((item) => parseFloat(item))
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
  logJson(values)
  if (process.env.SEED_DRYRUN) log("⚠️  SEED_DRYRUN env variable set - to place orders run UNSET SEED_DRYRUN ⚠️")
  return values
}

export function getTokenFromString(token: string): PublicKey{
  switch(true){
    case token === "betcoin":
      return new PublicKey("Qegj89Mzpx4foJJqkj6B4551aiGrgaV33Dtcm7WZ9kf")
    case token === "wins":
      // Then Monaco Protocol Devnnet token
      return new PublicKey("Aqw6KyChFm2jwAFND3K29QjUcKZ3Pk72ePe5oMxomwMH")
    case token === "usdc":
      // Mainnet token
      return new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
    case token === "usdt":
      // Mainnet token
      return new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
    default:
      return new PublicKey(token)
  }
}
