<p align="center">
  <img  src="https://lh3.googleusercontent.com/u/0/drive-viewer/AKGpihbt80G3fDilshM2wRTLITJgIxISH-7ZRnXzQIuMo4d3FOIdKDjufe0O7nxNLDglxFjqpirwYRXjjTd3V5-YOQ_8Z36pR6uK1sk=w1919-h992-v0">
</p>
<h1 align="center">
   Workshop Event Sourcing + CQRS
</h1>
<div align="center">

  <h3>Built With</h3>

  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white" height="30px"/>
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" height="30px">
  <img src="https://img.shields.io/badge/Babel-F9DC3e?style=for-the-badge&logo=babel&logoColor=black" height="30px">
  <img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" height="30px">
  
  <!-- Badges source: https://dev.to/envoy_/150-badges-for-github-pnk -->
</div>

<br/>

# Description

### Simple usage of event sourcing designer pattern with CQRS applied for a monolithic project. It intends to re-do 'GIT' user local repository with event sourcing pattern. This project is aming be help an initial trail in this pattern

</br>

# Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Starting Project](#starting-project)
  - [Environment Variables](#environment-variables)
  - [Test](#test)
  - [Other Scripts](#other-scripts)
- [Consulting Material](#consulting-material)
- [Acknowledgements ](#acknowledgements)
- [Authors](#authors)

# Getting Started

## Prerequisites

To run this project is necesary to install the following packages:

<div align="center">

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

</div>

- It is recommend to use VSCODE as your IDE

<div align="center">

![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

</div>

- To apply lint and prettier automatically, if you are using VSCODE, you should install [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.

## Starting Project

This Repo can be used by cloning the project

To clone the project, run the following command with ssh or clone with HTTPS option:

```bash
git clone git@github.com:VicterHuger/es-workshop.git
```

Then, navigate to the project folder and run the following command to install all dependencies:

```bash
yarn install
```

After adding your [enviroment variables](#environment-variables) to project, you can run Postgres SQL database by running docker

```bash
docker compose up -d
```

Run prisma migrations to apply prisma schema diffs to your local database

```bash
yarn prisma migrate dev
```

## Environment Variables

To run this project, you will need to create a `.env` file in root directory and
add the following environment variables to your .env file

```bash
# Your database URL - database should be es
DATABASE_URL = postgres://<userName>:<password>@<hostname>:<port>/es
```

```bash
# Your postgres user
POSTGRES_USER = <string>
# Your postgres password
POSTGRES_PASSWORD=
# Your postgres databases separated by comma, first should be es
POSTGRES_DATABASES=
```

Finally, you should be able to run the project properly

## Test

To run units tests, yould run the following command:

```bash
yarn test:unit
```

To apply functional automatized test on this project, you will need to create a `.env.test` file in root directory and
add the following environment variables to your .env.test file

```bash
DATABASE_URL = postgres://<userName>:<password>@<hostname>:<PORT>/<database-of-test-name-added-in-env-file>
```

Finally, run the functional test

```bash
yarn test:functional
```

You can also run all tests using:

```bash
yarn test
```

## Other scripts:

```bash
"prettier": "prettier --write './src'" #correct prettier problems
"prettier:check": "prettier --check './src'" #check if there are prettier problems

```

</br>

# Consulting Material

- [Slides](https://docs.google.com/presentation/d/1_mtgSEB_RgW6F6hIsp798YAR8bf1bk2z51k6ta_W9k0/edit?usp=sharing)

# Acknowledgements

- [Awesome Badges](https://github.com/Envoy-VC/awesome-badges)

</br>

# Authors

- [Victor Hugo Simões](https://github.com/VicterHuger)
  <br/>
