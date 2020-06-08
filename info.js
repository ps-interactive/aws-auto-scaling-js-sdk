const { message } = require('./helpers.js')
const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';
AWS.config.apiVersions = { ec2: '2016-11-15' };

const ec2 = new AWS.EC2();

const params = {
  Filters: [{Name: 'isDefault', Values: ['true']}]
};

ec2.describeVpcs(params, function(err, data) {
  if (err) console.log(err, err.stack);
  else     console.log(data);
});
