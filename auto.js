const { message } = require('./helpers.js')
const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';

const autoScaling = new AWS.AutoScaling()
const elb = new AWS.ELBv2()

/* Needs a Security Group port 3000: Should it be created with terraform or js? */
const launchConfigurationName = 'carved-rock-lc'
const userData = 'IyEvYmluL2Jhc2gNCmN1cmwgLXNMIGh0dHBzOi8vZGViLm5vZGVzb3VyY2UuY29tL3NldHVwXzE0LnggfCBzdWRvIC1FIGJhc2ggLQ0Kc3VkbyBhcHQtZ2V0IGluc3RhbGwgLXkgbm9kZWpzIGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9wcy1pbnRlcmFjdGl2ZS9hd3MtYXV0by1zY2FsaW5nLWFwcA0KY2QgYXdzLWF1dG8tc2NhbGluZy1hcHANCm5wbSBpDQpucG0gcnVuIHN0YXJ0'

const launchParams = {
  ImageId: 'ami-09dd2e08d601bff67',
  InstanceType: 't2.micro',
  LaunchConfigurationName: LaunchConfigurationName,
  SecurityGroups: [],
  UserData: userData
};
autoScaling.createLaunchConfiguration(launchParams, message);

/* Needs a Security Group port 80: Should it be created with terraform or js?*/
const lbParams = {
  Name: 'carved-rock-lb',
  Subnets: ['', ''],
  SecurityGroups: []
};
elb.createLoadBalancer(lbParams, message);

const targetParams = {
    Name: 'carved-rock-tg',
    Port: 3000,
    Protocol: 'HTTP',
    VpcId: ''
};
elb.createTargetGroup(targetParams, message);

const targetARN = '';
const loadBalancerARN = '';

const listenerParams = {
  DefaultActions: [{
    TargetGroupArn: targetARN,
    Type: 'forward'
  }],
  LoadBalancerArn: loadBalancerARN,
  Port: 80,
  Protocol: 'HTTP'
};
elb.createListener(listenerParams, message);

const autoScalingGroupName = 'carved-rock-asg';
const policyName = `${autoScalingGroupName}-policy`

const params = {
  AutoScalingGroupName: autoScalingGroupName,
  AvailabilityZones: ['us-west-2a', 'us-west-2b'],
  TargetGroupARNs: [ targetARN ],
  LaunchConfigurationName: launchConfigurationName,
  MaxSize: 2,
  MinSize: 1
};
autoScaling.createAutoScalingGroup(params, message);

const policyParams = {
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
autoScaling.putScalingPolicy(policyParams, message);
