import * as fs from "fs";
import * as csv from "fast-csv";
import { FormatterOptionsArgs, Row, writeToStream } from "@fast-csv/format";

export const csvHeaders = [
    "marketPk",
    "marketTitle",
    "marketType",
    "outcome",
    "forMidpoint",
    "forStakes",
    "againstMidpoint",
    "againstStakes",
    "seed"
]

type CsvFileOpts = {
  path: string;
  headers: string[];
};

export class CsvFile {
  static write(
    stream: NodeJS.WritableStream,
    rows: Row[],
    options: FormatterOptionsArgs<Row, Row>
  ): Promise<void> {
    return new Promise((res, rej) => {
      writeToStream(stream, rows, options)
        .on("error", (err: Error) => rej(err))
        .on("finish", () => res());
    });
  }

  readonly headers: string[];

  private readonly path: string;

  private readonly writeOpts: FormatterOptionsArgs<Row, Row>;

  constructor(opts: CsvFileOpts) {
    this.path = `${opts.path}.csv`;
    this.headers = opts.headers;
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
  }

  update(rows: Row[]): Promise<void> {
    return CsvFile.write(fs.createWriteStream(this.path), rows, {
      ...this.writeOpts,
      writeHeaders: true
    });
  }

  async readHeaders() {
    const content = await this.read();
    return Object.keys(content[0]);
  }

  append(rows: Row[]): Promise<void> {
    return CsvFile.write(
      fs.createWriteStream(this.path, { flags: "a" }),
      rows,
      {
        ...this.writeOpts,
        writeHeaders: false
      } as FormatterOptionsArgs<Row, Row>
    );
  }

  read(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const exists = fs.existsSync(this.path);
      if (!exists) throw new Error("File does not exist");
      const data = [] as any[];
      fs.createReadStream(this.path)
        .pipe(csv.parse({ headers: true }))
        .on("error", () => reject)
        .on("data", (row) => data.push(row))
        .on("end", () => resolve(data));
    });
  }

  async readAsObjects(){
    const dataPoints = await this.read()
    let objects = [] as any[]
    dataPoints.map((dataPoint) => {
        let object = {}
        let attributes = [...this.headers]
        attributes.map(function (attribute, i){
            object[attributes[i]] = dataPoint[attribute]
        })
        objects.push(object)
    })
    return objects
  }
}
