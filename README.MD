# BACKEND FOOD-DELIVERY

A nice project with a nice description

---

## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environnement.

### Node

- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
  Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v15.5.1

    $ npm --version
    7.3.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###

### Yarn installation

After installing node, this project will need yarn too, so just run the following command.

      $ npm install -g yarn

---

## Install

    $ git clone xxxxx
    $ cd Food-delivery-backend
    $ yarn install

## Configure app

add file `.env` then config like .env.example.

- install mongodb
- install redis

## Running the project

    $ yarn asyn-db  # run the database migration
    $ yarn yarn init-admin # create the admin user
    $ yarn init-db # create the database migration
    $ yarn start #start the server

## deploy

    # config ref :  https://chungtran4078.github.io/deploy-nodejs-app-using-nginx-pm2/

    $ Update file `ecosystem.config.js`

    $ yarn deploy
