const fs = require('fs')

const _ = require('lodash')
const AWS = require('aws-sdk')

AWS.config.region = 'us-west-2';
AWS.config.apiVersions = { ec2: '2016-11-15' };

const ec2 = new AWS.EC2();

const parse = require('minimist')(process.argv.slice(2));
const command = parse._[0];
const resourceName = parse._[1];

const message = (err, data) => {
  if (err) { console.log(`Error: ${err.message}`); }
  else if (data) {
    const json = JSON.stringify(data);
    if(Object.keys(data).length > 1) {
      fs.writeFileSync(`json/${Object.keys(data)[1]}.json`, json, 'utf-8');
    }
    console.log(`Success: ${json}`);
  }
};

const readJSON = (filename) => fs.existsSync(`json/${filename}.json`) ? JSON.parse(fs.readFileSync(`json/${filename}.json`)) : undefined;

const defaultSecurityGroupIngress = () => {
  const sgParams = { Filters: [{Name: 'group-name', Values: ['default']}] };
  ec2.describeSecurityGroups(sgParams, (err, data) => {
    if (err) { console.log(`Error: ${err.message}`); }
    else { 
      const ingressParams = {
        GroupId: data.SecurityGroups[0].GroupId,
        IpPermissions: [{
          IpProtocol: 'tcp',
          FromPort: 80,
          ToPort: 80,
          IpRanges: [{ CidrIp: '0.0.0.0/0' }]
        }, {
          IpProtocol: 'tcp',
          FromPort: 3000,
          ToPort: 3000,
          IpRanges: [{ CidrIp: '0.0.0.0/0' }]
        }]
      };
      ec2.authorizeSecurityGroupIngress(ingressParams, message);
    }
  });
};

const setup = async () => {
  const params = { Filters: [{Name: 'isDefault', Values: ['true']}] };
  ec2.describeVpcs(params, (err, data) => {
    if (err) { console.log(`Error: ${err.message}`); }
    else {
      fs.writeFileSync('json/Vpcs.json', JSON.stringify(data), 'utf-8');
      const subnetParams = { Filters: [{Name: "vpc-id", Values: [data.Vpcs[0].VpcId]}] };
      ec2.describeSubnets(subnetParams, (err, data) => {
        if (err) { console.log(`Error: ${err.message}`); }
        else { fs.writeFileSync(`json/Subnets.json`, JSON.stringify(data), 'utf-8'); }
      });
    }
  });
  defaultSecurityGroupIngress();
};

module.exports = { command, resourceName, message, readJSON, setup };
