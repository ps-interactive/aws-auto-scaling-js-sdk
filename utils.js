const fs = require('fs');

const message = (err, data) => {
  if (err) { console.log(`Error: ${err.message}`); }
  else if (data) {
    const json = JSON.stringify(data);
    if(Object.keys(data).length > 1) {
      fs.writeFileSync(`json/${Object.keys(data)[1]}.json`, json, 'utf-8');
    }
    console.log(`Success: ${json}`);
  }
};

const readJSON = (filename) => fs.existsSync(`json/${filename}.json`) ? JSON.parse(fs.readFileSync(`json/${filename}.json`)) : undefined;

const sortSubnets = (subnets) => _.map(_.sortBy(subnets.Subnets, 'AvailabilityZone'), subnet => subnet.SubnetId);
