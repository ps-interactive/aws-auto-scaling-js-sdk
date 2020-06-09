const { command, args, message, createSecurityGroup, getSubnetIds, getVpcId } = require('./helpers.js')

const AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';

const autoScaling = new AWS.AutoScaling()
const elb = new AWS.ELBv2()

const createLaunchConfiguration = (lcName, sgName) => {
  const userData = 'IyEvYmluL2Jhc2gNCmN1cmwgLXNMIGh0dHBzOi8vZGViLm5vZGVzb3VyY2UuY29tL3NldHVwXzE0LnggfCBzdWRvIC1FIGJhc2ggLQ0Kc3VkbyBhcHQtZ2V0IGluc3RhbGwgLXkgbm9kZWpzIGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9wcy1pbnRlcmFjdGl2ZS9hd3MtYXV0by1zY2FsaW5nLWFwcA0KY2QgYXdzLWF1dG8tc2NhbGluZy1hcHANCm5wbSBpDQpucG0gcnVuIHN0YXJ0'

  const params = {
    ImageId: 'ami-09dd2e08d601bff67',
    InstanceType: 't2.micro',
    LaunchConfigurationName: lcName,
    SecurityGroups: [sgName],
    UserData: userData
  };
  autoScaling.createLaunchConfiguration(params, message);
};

const createLoadBalancer = (lbName, sgName) => {
  getSubnetIds().then(subnets => {
    const params = {
      Name: lbName,
      Subnets: subnets,
      SecurityGroups: [sgName]
    };
    elb.createLoadBalancer(params, message);
  });
};

const createTargetGroup = (tgName) => {
  getVpcId().then(vpc => {
    const params = {
      Name: tgName,
      Port: 3000,
      Protocol: 'HTTP',
      VpcId: vpc
    };
    elb.createTargetGroup(params, message);
  });
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
  elb.createListener(params, message);
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
  autoScaling.createAutoScalingGroup(params, message);
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
  case 'sg':
    createSecurityGroup(args[0], args[1]);
    break;
  case 'config':
    createLaunchConfiguration(args[0], args[1])
    break;
  case 'load':
    createLoadBalancer(args[0]);
    break;
  case 'target':
    createTargetGroup(args[0]);
  case 'listener':
    break;
  case 'group':
    break;
  case 'policy':
    break;
  default:
    console.error('Not a valid command!');
    break;
}
