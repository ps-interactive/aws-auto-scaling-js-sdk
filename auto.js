const { command, resourceName, linkedResourceName, message, readJSON, setup, sortSubnets } = require('./helpers.js');

const createLaunchConfiguration = (name) => {};

const createLoadBalancer = (name) => {};

const createTargetGroup = (name) => {};

const createListener = () => {};

const createAutoScalingGroup = (name, lcName) => {};

const putScalingPolicy = (name) => {};

switch (command) {
  case    'setup': setup(); break;
  case   'config': createLaunchConfiguration(resourceName); break;
  case     'load': createLoadBalancer(resourceName); break;
  case   'target': createTargetGroup(resourceName); break;
  case 'listener': createListener(); break;
  case    'group': createAutoScalingGroup(resourceName, linkedResourceName); break;
  case   'policy': putScalingPolicy(resourceName); break;
  default        : console.error('Not a valid command!'); break;
}
