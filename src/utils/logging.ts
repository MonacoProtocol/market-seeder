import { ClientResponse } from "@monaco-protocol/client";

export enum LOG_TYPE {
  DEFAULT = 1,
  INFO = 2,
  WAITING = 3,
  SUCCESS = 4,
  DONE = 5,
  WARN = 6,
  ERROR = 7,
  JSON = 8,
  JSON_STRINGIFY = 9,
  RESPONSE = 10,
  TABLE = 11,
  TITLE = 12,
  CLEAR = 13
}

export function log(log: any, logType: LOG_TYPE = null) {
  const titleRepeater = 25;
  switch (true) {
    case logType === LOG_TYPE.DEFAULT:
      return baseLog(log);
    case logType === LOG_TYPE.INFO:
      return baseLog(log, "ℹ️");
    case logType === LOG_TYPE.WAITING:
      return baseLog(log, "⏱");
    case logType === LOG_TYPE.SUCCESS:
      return baseLog(log, "✅");
    case logType === LOG_TYPE.DONE:
      return baseLog(log, "✨");
    case logType === LOG_TYPE.WARN:
      return baseLog(log, "⚠️");
    case logType === LOG_TYPE.ERROR:
      return baseLog(log, "❌");
    case logType === LOG_TYPE.JSON:
      return console.log(log);
    case logType === LOG_TYPE.JSON_STRINGIFY:
      return console.log(JSON.stringify(log, null, 2));
    case logType === LOG_TYPE.RESPONSE:
      return logResponse(log);
    case logType === LOG_TYPE.TABLE:
      return logTable(log);
    case logType === LOG_TYPE.TITLE:
      return baseLog(
        `${"#".repeat(titleRepeater)}\n${log}\n${"#".repeat(titleRepeater)}`
      );
    case logType === LOG_TYPE.CLEAR:
      return console.clear();
    default:
      return baseLog(log);
  }
}

function baseLog(log: any, emoji: string = null) {
  if (emoji) console.log(`${log} ${emoji}`);
  else console.log(log);
}

function logJson(json: object) {
  console.log(JSON.stringify(json, null, 2));
}

function logTable(log: object) {
  console.table(log);
}

function logResponse(response: ClientResponse<any>) {
  if (!response.success) {
    if (response.errors[0]) baseLog(response.errors[0], "❌");
    else baseLog("Unknown error occurred", "❌");
  } else {
    logJson(response);
  }
}
