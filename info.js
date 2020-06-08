const _ = require('lodash')
const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';
AWS.config.apiVersions = { ec2: '2016-11-15' };

const ec2 = new AWS.EC2();

const params = {
  Filters: [{Name: 'isDefault', Values: ['true']}]
};

ec2.describeVpcs(params, (err, data) => {
  if (err) { console.log(err, err.stack); }
  else {
    const vpcID = data.Vpcs[0].VpcId;
    const subnetParams = { Filters: [{Name: "vpc-id", Values: [vpcID]}] };
    ec2.describeSubnets(subnetParams, (err, data) => {
      if (err) { console.log(err, err.stack); }
      else {
        console.log('VpcId:', vpcID)
        _.map(_.sortBy(data.Subnets, 'AvailabilityZone'), item => console.log(`AvailabilityZone: ${item.AvailabilityZone}\tSubnetId: ${item.SubnetId}` ));
      }
    });
  }
});
