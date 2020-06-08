const { message } = require('./helpers.js')
const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';

const autoScaling = new AWS.AutoScaling()
const elb = new AWS.ELBv2()

const launchConfigurationName = 'carved-rock-lc'

const createLaunchConfiguration = () => {
  /* Needs a Security Group port 3000: Should it be created with terraform or js? */
  const userData = 'IyEvYmluL2Jhc2gNCmN1cmwgLXNMIGh0dHBzOi8vZGViLm5vZGVzb3VyY2UuY29tL3NldHVwXzE0LnggfCBzdWRvIC1FIGJhc2ggLQ0Kc3VkbyBhcHQtZ2V0IGluc3RhbGwgLXkgbm9kZWpzIGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9wcy1pbnRlcmFjdGl2ZS9hd3MtYXV0by1zY2FsaW5nLWFwcA0KY2QgYXdzLWF1dG8tc2NhbGluZy1hcHANCm5wbSBpDQpucG0gcnVuIHN0YXJ0'

  const params = {
    ImageId: 'ami-09dd2e08d601bff67',
    InstanceType: 't2.micro',
    LaunchConfigurationName: launchConfigurationName,
    SecurityGroups: [],
    UserData: userData
  };
  autoScaling.createLaunchConfiguration(params).promise();
};

const createLoadBalancer = () => {
  /* Needs a Security Group port 80: Should it be created with terraform or js?*/
  const params = {
    Name: 'carved-rock-lb',
    Subnets: ['', ''],
    SecurityGroups: []
  };
  elb.createLoadBalancer(params).promise();
};

const createTargetGroup = () => {
  const params = {
    Name: 'carved-rock-tg',
    Port: 3000,
    Protocol: 'HTTP',
    VpcId: ''
  };
  elb.createTargetGroup(params).promise();
};


const targetARN = '';
const loadBalancerARN = '';
const createListener = () => {
  const params = {
    DefaultActions: [{
      TargetGroupArn: targetARN,
      Type: 'forward'
    }],
    LoadBalancerArn: loadBalancerARN,
    Port: 80,
    Protocol: 'HTTP'
  };
  elb.createListener(params).promise();
};

const autoScalingGroupName = 'carved-rock-asg';
const policyName = `${autoScalingGroupName}-policy`
const createAutoScalingGroup = () => {
  const params = {
    AutoScalingGroupName: autoScalingGroupName,
    AvailabilityZones: ['us-west-2a', 'us-west-2b'],
    TargetGroupARNs: [ targetARN ],
    LaunchConfigurationName: launchConfigurationName,
    MaxSize: 2,
    MinSize: 1
  };
  autoScaling.createAutoScalingGroup(params).promise();
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
  autoScaling.putScalingPolicy(params).promise();
};
