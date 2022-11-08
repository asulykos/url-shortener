<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

URL shortener demo.

Task description:
In this challenge, we're asking you to spice up your life with your very own URL Shortener!
We've all seen sites like bit.ly that allow you to shorten a URL into something... well... shorter!
It's time to make your own.
There are roughly four parts to this challenge:
1. Make a small API app that receives in a URL with a stack of your choice.
2. Using the supplied URL, generate a unique URL with the base of tier.app. It should be
generated keeping uniqueness in mind.
3. Return the shortened URL.
4. Bonus: track the visits in a second DB table for stats.

## Installation

```bash
$ npm install
```

## Starting a local MongoDB using Docker

```bash
$ npm run start:db
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
