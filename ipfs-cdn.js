#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const cheerio = require("cheerio");
const ipfsClient = require("ipfs-http-client");

const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const ipfs = ipfsClient();

async function uploadAndReplace() {}

async function parse(file) {
  const location = path.dirname(file);
  const source = await readFile(file);
  const $ = cheerio.load(source);
  const promises = $("img")
    .map(async (_, elem) => {
      let src = path.resolve(location, $(elem).attr("src"));
      for await (const result of ipfs.add(await readFile(src))) {
        const cid = result.path;
        //console.log("result", src, result);
        $(elem).attr("src", "ipfs://" + cid);
      }
      return true;
    })
    .get();

  await Promise.all(promises);
  console.log($.html());
}

function main(files) {
  files.forEach(parse);
}

main(process.argv.splice(2));
