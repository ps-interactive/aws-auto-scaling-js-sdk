const { command, resourceName, linkedResourceName, message, readJSON, setup, sortSubnets } = require('./helpers.js');

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
  const subnets = sortSubnets(readJSON('Subnets'));
  if (subnets) {
    const params = { Name: name, Subnets: subnets };
    elb.createLoadBalancer(params, message);
  } else {
    console.log("There was an error reading the `Subnets.json` file. Have you run the `setup` command?");
  }
};

const createTargetGroup = (name) => {
  const vpc = readJSON('Vpcs');
  if (vpc) {
    const params = { Name: name, Port: 3000, Protocol: 'HTTP', VpcId: vpc.Vpcs[0].VpcId };
    elb.createTargetGroup(params, message);
  }  else {
    console.log("There was an error reading the `Vpcs.json` file. Have you run the `setup` command?");
  }
};

const createListener = () => {
  const targetGroup = readJSON('TargetGroups');
  const loadBalancer = readJSON('LoadBalancers');
  if (targetGroup && loadBalancer) {
    const params = {
      DefaultActions: [{
        TargetGroupArn: targetGroup.TargetGroups[0].TargetGroupArn,
        Type: 'forward'
      }],
      LoadBalancerArn: loadBalancer.LoadBalancers[0].LoadBalancerArn,
      Port: 80,
      Protocol: 'HTTP'
    };
    elb.createListener(params, message);
  } else {
    console.log('Have you created a Target Group and a Load Balancer?');
  }
};

const createAutoScalingGroup = (name, lcName) => {
  const targetGroup = readJSON('TargetGroups');
  if (targetGroup) {
    const params = {
      AutoScalingGroupName: name,
      AvailabilityZones: ['us-west-2a', 'us-west-2b', 'us-west-2c', 'us-west-2d'],
      TargetGroupARNs: [ targetGroup.TargetGroups[0].TargetGroupArn ],
      LaunchConfigurationName: 'carved-rock-lc',
      MaxSize: 2,
      MinSize: 1
    };
    autoScaling.createAutoScalingGroup(params, message);
  } else {
    console.log('Have you created a Target Group?');
  }
};

const putScalingPolicy = (name, ASGName) => {
  const params = {
    AdjustmentType: 'ChangeInCapacity',
    AutoScalingGroupName: ASGName,
    PolicyName: name,
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
    createAutoScalingGroup(resourceName, linkedResourceName);
    break;
  case 'policy':
    putScalingPolicy(resourceName, linkedResourceName);
    break;
  default:
    console.error('Not a valid command!');
    break;
}
