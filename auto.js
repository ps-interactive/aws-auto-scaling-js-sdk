const { command, resourceName, message, readJSON, setup } = require('./helpers.js');

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const autoScaling = new AWS.AutoScaling();
const elb = new AWS.ELBv2();

const createLaunchConfiguration = (name) => {
  const json = readJSON('UserData');
  if (json) {
    const params = {
      LaunchConfigurationName: name,
      ImageId: json.ImageId,
      InstanceType: json.InstanceType,
      UserData: json.UserData
    };
    autoScaling.createLaunchConfiguration(params, message);
  } else {
    console.log("There was an error reading the `UserData.json` file.");
  }
};

const createLoadBalancer = (name) => {
  const json = readJSON('Subnets');
  if (json) {
    const params = { Name: name, Subnets: json.Subnets };
    elb.createLoadBalancer(params, message);
  } else {
    console.log("There was an error reading the `Subnets.json` file. Have you run the `setup` command?");
  }
};

const createTargetGroup = (name) => {
  const json = readJSON('Vpcs');
  if (json) {
    const params = { Name: name, Port: 3000, Protocol: 'HTTP', VpcId: json.Vpcs[0].VpcId };
    elb.createTargetGroup(params, message);
  }  else {
    console.log("There was an error reading the `Vpcs.json` file. Have you run the `setup` command?");
  }
};

const createListener = () => {
  const targetGroupArn = readJSON('TargetGroups');
  const loadBalancerArn = readJSON('LoadBalancers');
  if (targetGroupArn && loadBalancerArn) {
    const params = {
      DefaultActions: [{
        TargetGroupArn: targetGroupArn,
        Type: 'forward'
      }],
      LoadBalancerArn: loadBalancerArn,
      Port: 80,
      Protocol: 'HTTP'
    };
    elb.createListener(params, message);
  } else {
    console.log('Have you created a Target Group and a Load Balancer?');
  }
};

const autoScalingGroupName = 'carved-rock-asg';
const policyName = `${autoScalingGroupName}-policy`;
const createAutoScalingGroup = () => {
  const targetGroupArn = readJSON('TargetGroups');
  if (targetGroupArn) {
    const params = {
      AutoScalingGroupName: autoScalingGroupName,
      AvailabilityZones: ['us-west-2c', 'us-west-2b'],
      TargetGroupARNs: [ targetGroupArn ],
      LaunchConfigurationName: 'carved-rock-lc',
      MaxSize: 2,
      MinSize: 1
    };
    autoScaling.createAutoScalingGroup(params, message);
  } else {
    console.log('Have you created a Target Group?');
  }
};

const putScalingPolicy = () => {
  const params = {
    AdjustmentType: 'ChangeInCapacity',
    AutoScalingGroupName: autoScalingGroupName,
    PolicyName: policyName,
    PolicyType: 'TargetTrackingScaling',
    TargetTrackingConfiguration: {
      TargetValue: 5,
      PredefinedMetricSpecification: {
        PredefinedMetricType: 'ASGAverageCPUUtilization'
      }
    }
  };
  autoScaling.putScalingPolicy(params, message);
};

switch (command) {
  case 'setup':
    setup();
    break;
  case 'config':
    createLaunchConfiguration(resourceName);
    break;
  case 'load':
    createLoadBalancer(resourceName);
    break;
  case 'target':
    createTargetGroup(resourceName);
  case 'listener':
    createListener();
    break;
  case 'group':
    createAutoScalingGroup();
    break;
  case 'policy':
    putScalingPolicy();
    break;
  default:
    console.error('Not a valid command!');
    break;
}
