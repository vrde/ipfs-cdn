const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const cheerio = require("cheerio");
const ipfsClient = require("ipfs-http-client");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const ipfs = ipfsClient();

async function parse(root, inFile, outFile, upload = true, dryRun = false) {
  const location = path.dirname(inFile);
  const source = await readFile(inFile);
  const $ = cheerio.load(source);
  const promises = $("img")
    .map(async (_, elem) => {
      let src = $(elem).attr("src");
      if (src.startsWith("/")) {
        src = path.join(root, src);
      } else {
        src = path.resolve(location, src);
      }
      const results = ipfs.add(await readFile(src), { onlyHash: !upload });
      for await (const result of results) {
        const cid = result.path;
        const original = $(elem).toString();
        $(elem).attr("src", "ipfs://" + cid);
        if (outFile) {
          console.log(
            `[Replace] File: ${inFile}`,
            `\n\tOriginal: ${original}`,
            `\n\tNew     : ${$(elem).toString()}`
          );
        } else {
          console.log(`[Parse] File: ${inFile}`, `\n\tPin: ${cid}`);
        }
      }
    })
    .get();

  if (!outFile) return;

  $("head").append([
    '<script src="https://unpkg.com/ipfs/dist/index.js"></script>',
    '<script src="https://unpkg.com/hlsjs-ipfs-loader@0.1.4/dist/index.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>',
    '<script src="/ipfs-shim.js"></script>'
  ]);
  await Promise.all(promises);
  const dirname = path.dirname(outFile);
  console.log(
    dryRun ? "[Write (dry)]" : "[Write]",
    "File:",
    inFile,
    "to:",
    outFile
  );
  if (!dryRun) {
    await mkdir(dirname, { recursive: true });
    await writeFile(outFile, $.html());
  }
}

module.exports = {
  parse
};
