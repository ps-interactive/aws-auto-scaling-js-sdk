const { command, resourceName, message, readJSON, setup } = require('./helpers.js');

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

const autoScaling = new AWS.AutoScaling();
const elb = new AWS.ELBv2();

const createLaunchConfiguration = (name) => {
  const userData = 'IyEvYmluL2Jhc2gNCmN1cmwgLXNMIGh0dHBzOi8vZGViLm5vZGVzb3VyY2UuY29tL3NldHVwXzE0LnggfCBzdWRvIC1FIGJhc2ggLQ0Kc3VkbyBhcHQtZ2V0IGluc3RhbGwgLXkgbm9kZWpzIGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9wcy1pbnRlcmFjdGl2ZS9hd3MtYXV0by1zY2FsaW5nLWFwcA0KY2QgYXdzLWF1dG8tc2NhbGluZy1hcHANCm5wbSBpDQpucG0gcnVuIHN0YXJ0';
  const params = {
    ImageId: 'ami-09dd2e08d601bff67',
    InstanceType: 't2.micro',
    LaunchConfigurationName: name,
    UserData: userData
  };
  autoScaling.createLaunchConfiguration(params, message);
};

const createLoadBalancer = (name) => {

  const params = { Name: name, Subnets: subnets };
  elb.createLoadBalancer(params, message);

};

const createTargetGroup = (name) => {
  getVpcId().then(vpc => {
    const params = { Name: name, Port: 3000, Protocol: 'HTTP', VpcId: vpc };
    elb.createTargetGroup(params, message);
  });
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
    console.log('Have you created a Target Group and a Load Balancer?')
  }
};

const autoScalingGroupName = 'carved-rock-asg';
const policyName = `${autoScalingGroupName}-policy`
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
    console.log('Have you created a Target Group?')
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
