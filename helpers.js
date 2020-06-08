const AWS = require('aws-sdk')

const parse = require('minimist')(process.argv.slice(2));

const command = parse._[0];

const message = (err, data) => {
  if (err) { console.log(`Error: ${err.message}`); }
  else if (data) { console.log(`Success: ${JSON.stringify(data)}`); }
};

const createSecurityGroup = async (name, port) => {
  const ec2 = new AWS.EC2()
  try {
    const params = {
      Description: name,
      GroupName: name
    }
    const group  = await ec2.createSecurityGroup(params).promise();

    const params = {
      GroupId: group.GroupId,
      IpPermissions: [{
        IpProtocol: 'tcp',
        FromPort: port,
        ToPort: port,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }]
      }]
    }
    return await ec2.authorizeSecurityGroupIngress(params).promise();
  } catch {
    if (typeof err === 'string') {
      console.log(err);
    } else {
      console.log(err, err.stack);
    }
  }
}

module.exports = { command, instance, message, createSecurityGroup };
