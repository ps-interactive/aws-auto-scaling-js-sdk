const _ = require('lodash')
const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';
AWS.config.apiVersions = { ec2: '2016-11-15' };

const ec2 = new AWS.EC2();

const parse = require('minimist')(process.argv.slice(2));

const command = parse._[0];
const args = parse._.slice(1);

const message = (err, data) => {
  if (err) { console.log(`Error: ${err.message}`); }
  else if (data) { console.log(`Success: ${JSON.stringify(data)}`); }
};

const handle = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}

const vpcIdAsync = async (vpc) => await vpc.Vpcs[0].VpcId;
const getVpcId = async () => {
  const params = { Filters: [{Name: 'isDefault', Values: ['true']}] };
  let [vpc, vpcErr] = await handle(ec2.describeVpcs(params).promise());
  if (vpcErr) throw new Error('Could not fetch VPC details.');
  let [vpcId, vpcIdErr] = await handle(vpcIdAsync(vpc));
  if (vpcIdErr) throw new Error('Could not fetch Subnet details.');
  return vpcId;
}

const createSecurityGroup = async (name, port) => {
  const params = { Description: name, GroupName: name };
  ec2.createSecurityGroup(params, (err, data) => {
    if (err) { console.log(`Error: ${err.message}`); }
    else { 

      const ingressParams = {
        GroupId: data.GroupId,
        IpPermissions: [{
          IpProtocol: 'tcp',
          FromPort: port,
          ToPort: port,
          IpRanges: [{ CidrIp: '0.0.0.0/0' }]
        }]
      };
      ec2.authorizeSecurityGroupIngress(ingressParams, message);
    }
  });
}

const sortSubnets = async (subnets) => {
  return await _.map(_.sortBy(subnets.Subnets, 'AvailabilityZone'), subnet => subnet.SubnetId).slice(1, 3);
};

const getSubnetIds = async () => {
  const params = { Filters: [{Name: 'isDefault', Values: ['true']}] };
  let [vpc, vpcErr] = await handle(ec2.describeVpcs(params).promise());
  if (vpcErr) throw new Error('Could not fetch VPC details.');
  const vpcId = vpc.Vpcs[0].VpcId
  const subnetParams = { Filters: [{Name: "vpc-id", Values: [vpcId]}] };
  let [subnets, subnetsErr] = await handle(ec2.describeSubnets(subnetParams).promise());    
  if (subnetsErr) throw new Error('Could not fetch Subnet details.');
  let [subnetIds, subnetIdsErr] = await handle(sortSubnets(subnets));
  if (subnetIdsErr) throw new Error('Could not fetch Subnet details.');
  return subnetIds;
}

module.exports = { command, args, message, createSecurityGroup, getSubnetIds, getVpcId };
