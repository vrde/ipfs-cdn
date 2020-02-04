#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const cheerio = require("cheerio");
const ipfsClient = require("ipfs-http-client");

const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const ipfs = ipfsClient();

async function uploadAndReplace() {}

async function parse(root, output, file) {
  const location = path.dirname(file);
  const source = await readFile(file);
  const $ = cheerio.load(source);
  const promises = $("img")
    .map(async (_, elem) => {
      let src = $(elem).attr("src");
      if (src.startsWith("/")) {
        src = path.join(root, src);
      } else {
        src = path.resolve(location, src);
      }

      for await (const result of ipfs.add(await readFile(src))) {
        const cid = result.path;
        // console.log("result", src, result);
        $(elem).attr("src", "ipfs://" + cid);
      }
      return true;
    })
    .get();

  $("head").append([
    '<script src="https://unpkg.com/ipfs/dist/index.js"></script>',
    '<script src="https://unpkg.com/hlsjs-ipfs-loader@0.1.4/dist/index.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>',
    '<script src="/ipfs-shim.js"></script>'
  ]);
  await Promise.all(promises);
  //console.log(file);
  await writeFile(path.join(output, file), $.html());
}

function main(root, output, files) {
  files.forEach(parse.bind(null, root, output));
}

const [_0, _1, root, output, ...files] = process.argv;
main(root, output, files);
