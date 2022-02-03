const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();

app.use(cors());

const port = process.env["PORT"] || 3000;

const provider = new ethers.providers.CloudflareProvider();
app.get("/:address", async (req, res) => {
  const address = req.params.address;
  res
    .header("Content-Type", "text/plain; charset=UTF-8")
    .set("Cache-Control", "public, max-age=300");
  if (!address) {
    res.status(404).send();
    return;
  }

  if (address.endsWith(".eth")) {
    const resolved = await provider.resolveName(address);
    if (!resolved) {
      res.status(404).send();
    } else {
      res.status(200).send(resolved);
    }
  } else if (address.startsWith("0x")) {
    try {
      const resolved = await provider.lookupAddress(address);
      if (!resolved) {
        res.status(404).send();
      } else {
        res.status(200).send(resolved);
      }
    } catch (e) {
      if (e.code == "INVALID_ARGUMENT") {
        return res.status(400).send();
      }
      return res.status(404).send();
    }
  } else {
    return res.status(400).send();
  }
});

app.listen(port, () => {
  console.log(`ens app listening on port ${port}`);
});
