# Sysco Point of Sales System - REST API

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/047d35f7d499401e89fa8d34c6b84dee)](https://www.codacy.com/app/blog.padmal/sysco-pos-nodejs-server?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=CloudyPadmal/sysco-pos-nodejs-server&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.com/CloudyPadmal/sysco-pos-nodejs-server.svg?branch=master)](https://travis-ci.com/CloudyPadmal/sysco-pos-nodejs-server)
[![codecov](https://codecov.io/gh/CloudyPadmal/sysco-pos-nodejs-server/branch/development/graph/badge.svg)](https://codecov.io/gh/CloudyPadmal/sysco-pos-nodejs-server)
![GitHub Release Date](https://img.shields.io/github/release-date/CloudyPadmal/sysco-pos-nodejs-server.svg)
![Website](https://img.shields.io/website/https/sysco-pos-rest-api.herokuapp.com/api.svg?down_color=lightgrey&down_message=offline&up_color=green&up_message=online)
![GitHub repo size in bytes](https://img.shields.io/github/repo-size/CloudyPadmal/sysco-pos-nodejs-server.svg)
![Repo description](https://img.shields.io/badge/endpoint-backend-blueviolet.svg)

This repository contains source code related to the back end REST API implemented as one of the requirements in Sysco LABS induction program 2019. Source code is developed using NodeJS using VSCode IDE. There are two branches maintained in this project.

- `development` branch containing source code under development
- `deployment` hosting branch in Heroku. Pushes to this branch will deploy the content in the hosted API

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

- [VSCode](https://code.visualstudio.com/download)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [NodeJS & npm](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04)

### Installing

Configuring the project in your own workstation is easy. First, make sure the prerequisites tools and libraries are installed. Clone the project and install dependencies using `npm install` command. Once all the dependencies are set, go to root folder and run `node server.js`. It will display on which port the application has started and a link to access the API. You will require to set an environment variable for database connection.

```
$ export DATABASE_URL=mongodb://localhost:27017/[db name here]
```

## Running the tests

API is fully integrated with unit testing and it covers almost 100% of source code. Tests can be run using the following command on a single test file by defining the file name or on the whole project by simply omitting the file name parameter.

```
$ npm test <file-name>
```

## Deployment

This API is deployed in a free Heroku platform. There might be slight delays in responses due to the use of free dynos. In order to deploy your own version of this API, please follow deployment instructions provided in Heroku. URL for the API is [`sysco-pos-rest-api.herokuapp.com/api`](https://sysco-pos-rest-api.herokuapp.com/api). Swagger documentation can be found in the [swaggerhub](https://app.swaggerhub.com/apis-docs/CloudyPadmal/Sysco-POS/1.0.3)

## Maintainer

* **Padmal**