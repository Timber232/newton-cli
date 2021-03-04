#!/usr/bin/env node

const
    axios = require('axios'),
    nconf = require('nconf'),
    crypto = require('crypto'),
    yargs = require('yargs');

// User input
const args = yargs
    .usage("Usage: -path <path>")
    .option("p", {alias: "path", describe: "Your path", type: "string", demandOption: true})
    .argv;

// Read config file for authentication
nconf
    .argv()
    .env()
    .file({file: 'newton-config.json'});

// Authentication information
const CLIENT_ID = nconf.get('client-id');
const CLIENT_SECRET = nconf.get('secret-key');
const currentTime = Math.round((new Date()).getTime() / 1000);


// Signature generation
const signatureParameters = [
    "GET",
    "",
    `/v1/${args.path}`,
    "",
    currentTime
];

const signatureData = signatureParameters.join(":");

const computedSignature = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(signatureData)
    .digest("base64");

const NewtonAPIAuth = `${CLIENT_ID}:${computedSignature}`;

// Fetch data
axios
    .get(`https://api.newton.co/v1/${args.path}`,
        {
            headers: {
                'NewtonAPIAuth': NewtonAPIAuth,
                'NewtonDate': currentTime
            }
        }
    )
    .then((response) => {
            console.log(response.data);
            console.log(response.status);
        }
    );
