# Hibiki

[![Discord](https://img.shields.io/discord/251664386459041792.svg?style=flat-square)](https://discord.gg/rmMTZue) [![CodeClimate Issues](https://img.shields.io/codeclimate/issues/github/ClarityMoe/hibiki.svg?style=flat-square)](https://codeclimate.com/github/ClarityMoe/hibiki/issues) [![CodeClimate](https://img.shields.io/codeclimate/github/ClarityMoe/hibiki.svg?style=flat-square)](https://codeclimate.com/github/ClarityMoe/hibiki) [![Release](https://img.shields.io/github/release/ClarityMoe/hibiki.svg?style=flat-square)](https://github.com/ClarityMoe/hibiki/releases) [![Dependencies](https://david-dm.org/ClarityMoe/hibiki.svg?style=flat-square)](https://david-dm.org/ClarityMoe/hibiki) [![CircleCI](https://img.shields.io/circleci/project/github/ClarityMoe/hibiki.svg?style=flat-square)](https://circleci.com/gh/ClarityMoe/hibiki) [![AppVeyor](https://img.shields.io/appveyor/ci/noud02/hibiki.svg?style=flat-square)](https://ci.appveyor.com/project/noud02/hibiki/)

A Powerful but easy to use Discord bot framework

## Installation

```bash
$ npm i ClarityMoe/hibiki --save
# installs the framework
```

## Usage

```ts
import { Shard as Hibiki } from "hibiki";

const bot: Hibiki = new Hibiki("token", require("./config.json"));

bot.on("ready", () => {
    console.log("Ready!");
});

bot.on("blocked", (ms) => {
    console.log("Blocked for", `${ms}ms`);
});

```