const _ = require("lodash");
const AWS = require('aws-sdk');
const parse = require('minimist')(process.argv.slice(2));

const command = parse._[0];
const instance = parse._[1];
const tag = parse._[2];

AWS.config = {
  region: 'us-west-2',
  apiVersions: { ec2: '2016-11-15' }
};
const ec2 = new AWS.EC2();

const message = (err, data) => {
  if (err) { console.log(`Error: ${err.message}`); }
  else if (data) { console.log(`Success: ${JSON.stringify(data)}`); }
};

const getKey = async name => {
  let data = await ec2.describeKeyPairs().promise();
  let result = _.filter(data.KeyPairs, { KeyName: name })
  return result.length == 1;
};

const keyExists = async (name, func) => !await getKey(name) ? func() : console.log("A key exists with that name.");
const ensureKey = async (name, func) => await getKey(name) ? func() : console.log("A key doesn't exists with that name.");


module.exports = { command, instance, tag, message, keyExists, ensureKey };
