const { message, readJSON, sortSubnets } = require('./utils.js');

const createLaunchConfiguration = (name) => {};

const createLoadBalancer = (name) => {};

const createTargetGroup = (name) => {};

const createListener = () => {};

const createAutoScalingGroup = (name, lcName) => {};

const putScalingPolicy = (name) => {};







/****
 CLI 
****/
const cli = require('./cli.js');
switch (cli.command) {
  case    'setup': cli.setup(); break;
  case   'config': createLaunchConfiguration(cli.resourceName); break;
  case     'load': createLoadBalancer(cli.resourceName); break;
  case   'target': createTargetGroup(cli.resourceName); break;
  case 'listener': createListener(); break;
  case    'group': createAutoScalingGroup(cli.resourceName, cli.linkedResourceName); break;
  case   'policy': putScalingPolicy(cli.resourceName); break;
  default        : console.error('Not a valid command!'); break;
}
