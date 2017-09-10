# Hibiki

[![Discord](https://img.shields.io/discord/251664386459041792.svg?style=flat-square)](https://discord.gg/rmMTZue) [![CodeClimate Issues](https://img.shields.io/codeclimate/issues/github/ClarityMoe/hibiki.svg?style=flat-square)](https://codeclimate.com/github/ClarityMoe/hibiki/issues) [![CodeClimate](https://img.shields.io/codeclimate/github/ClarityMoe/hibiki.svg?style=flat-square)](https://codeclimate.com/github/ClarityMoe/hibiki) [![Release](https://img.shields.io/github/release/ClarityMoe/hibiki.svg?style=flat-square)](https://github.com/ClarityMoe/hibiki/releases) [![Dependencies](https://david-dm.org/ClarityMoe/hibiki.svg?style=flat-square)](https://david-dm.org/ClarityMoe/hibiki) [![CircleCI](https://img.shields.io/circleci/project/github/ClarityMoe/hibiki.svg?style=flat-square)](https://circleci.com/gh/ClarityMoe/hibiki) [![AppVeyor](https://img.shields.io/appveyor/ci/noud02/hibiki.svg?style=flat-square)](https://ci.appveyor.com/project/noud02/hibiki/) [![NPM Version](https://img.shields.io/npm/v/hibiki.svg?style=flat-square)](https://npmjs.com/package/hibiki) [![NPM Downloads](https://img.shields.io/npm/dt/hibiki.svg?style=flat-square)](https://npmjs.com/package/hibiki)

A Powerful but easy to use Discord bot framework

## Installation

```bash
$ npm i hibiki --save
# Install from NPM

$ npm i ClarityMoe/hibiki --save
# Install from github

```

## Usage

```ts
import { Shard as Hibiki } from "hibiki";

const bot: Hibiki = new Hibiki("token", {
    // ...
});

bot.connect();

bot.on("ready", () => {
    bot.init();
    console.log("Ready!");
});

```

More examples can be found in /examples

## Database

Run these commands to set up the database.

```bash

# Install Postgres
$ sudo pacman -S postgresql
# or
$ sudo apt-get install postgresql
# I assume you know enough about your package manager to install postgresql
# not gonna list them all, sorry

# Now follow this on how to get postgres ready for use
# https://wiki.archlinux.org/index.php/PostgreSQL#Installing_PostgreSQL

$ createdb hibiki
# Create the database, you can change 'hibiki' to whatever you want your db name to be

$ psql hibiki
# When you're in, please run the commands below this code block

```

```sql

-- Create the 'guilds' table

CREATE TABLE guilds (
    id          text,
    prefixes    text[],
    name        text
);

-- Create an unique index

CREATE UNIQUE INDEX IN guilds (id);

-- Create the 'users' table

CREATE TABLE users (
    id              text,
    discriminator   text,
    username        text,
    blocked         boolean
);

-- Create an unique index again

CREATE UNIQUE INDEX IN users (id);

-- Check if the tables are there

SELECT * FROM guilds;
SELECT * FROM users;

```