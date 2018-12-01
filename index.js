const fs = require('fs');
const path = require('path');
const appRootPath = require('app-root-path');
const mkdirp = require('mkdirp');
const _ = require('lodash');

const contentPromises = [];
let configFiles = [];
let environments = [];
let compiledConfigString = {};
let environmentsDirectories = {};


const fetchLast = (item, config) => new Promise((resolve) => {
  const valueByEnvs = {};
  config.environments.forEach((key) => { valueByEnvs[key] = {}; });

  const environs = config.environments.map(env => env);

  _.forEach(item, (val, key) => {
    if (typeof val === 'object' && !Object.keys(val).some(v => environs.includes(v))) {
      fetchLast(val, config).then((result) => {
        environs.forEach((env) => {
          valueByEnvs[env][key] = result[env];
        });
      });
    } else {
      Object.keys(val).forEach((env) => {
        if (valueByEnvs[env]) {
          valueByEnvs[env][key] = val[env];
        }
      });
    }
  });
  resolve(valueByEnvs);
});

// 0. processes each key and spit out segregated configs
const processor = (item, config = { environments }) => {
  const processed = {};
  config.environments.forEach((key) => { processed[key] = {}; });

  const nested = {}; // used to map last key before environments
  return new Promise((resolve) => {
    _.forEach(item, (val, key) => {
      if (Object.keys(val).some(v => config.environments.includes(v))) { // last object
        Object.keys(val).forEach((env) => {
          processor(val, config).then((processedItem) => {
            if (processed[env]) {
              processed[env][key] = processedItem[0][env];
              nested[key] = processedItem[0][env];
            }
          });
        });
      } else if (Array.isArray(val)) { // if not last - isArray ?
        config.environments.forEach((env) => { if (env === key) { processed[env] = val; } });
      } else if (typeof val === 'object') { // not last and is an object
        fetchLast(val, config).then((result) => {
          config.environments.forEach((env) => { processed[env][key] = result[env]; });
        });
      } else if (config.environments.includes(key)) { // not an object =>
        config.environments.forEach((env) => { if (env === key) { processed[key] = item[key]; } });
      }
    });

    resolve([processed, nested]);
  });
};

const doProcess = config => new Promise((resolve) => {
  const processedConfig = {};
  environments.forEach((key) => { processedConfig[key] = {}; });

  Object.keys(config).forEach((item) => {
    processor(config[item]).then((processed) => {
      environments.forEach((env) => {
        processedConfig[env][item] = processed[0][env];
      });
    });
  });
  resolve(processedConfig);
});


const filter = (config, nested) => new Promise((resolve) => {
  if (nested) {
    doProcess(config).then(output => resolve(output));
  } else {
    const processedPart = {};
    Object.keys(config).filter(key => environments.indexOf(key) > -1).forEach((item) => {
      processedPart[item] = config[item];
    });
    resolve(processedPart);
  }
});


const compileByEnv = (content, nested) => new Promise((resolve) => {
  const contentOut = {};
  environments.forEach((key) => { contentOut[key] = {}; });

  Object.keys(content).forEach((item) => {
    filter(content[item], nested).then((processed) => {
      environments.forEach((env) => {
        contentOut[env][item] = processed[env];
      });
      resolve(contentOut);
    });
  });
});


const appendConfig = (file, content, nested) => new Promise((resolve) => {
  compileByEnv(content, nested).then((out) => {
    Object.keys(out).forEach((env) => {
      if (nested) {
        compiledConfigString[env] += `window.${file} = ${JSON.stringify(out[env][file], null, 2)}\n`;
      } else {
        Object.keys(out[env]).forEach((item) => {
          compiledConfigString[env] += typeof out[env][item] === 'string' ? `window.${item} = "${out[env][item]}"\n` : `window.${item} = ${out[env][item]}\n`;
        });
      }
    });
    resolve();
  });
});


const writeToFile = (env, location, content) => new Promise((resolve) => {
  fs.writeFileSync(location, content, (err) => {
    if (err) console.error(err);
    resolve({ msg: `Successfully compiled config for ${env}` });
  });
});


const compile = (configs, environs, outputDirs) => new Promise((resolve) => {
  environments = environs;
  configFiles = require(`${path.resolve(appRootPath.path, configs)}/config-files.json`);
  compiledConfigString = environments.reduce((o, key) => Object.assign(o, { [key]: '' }), {});
  environmentsDirectories = environments.reduce(
    (o, key, index) => Object.assign(o, { [key]: outputDirs[index] }),
    {},
  );

  configFiles.forEach((file) => {
    const content = require(path.resolve(appRootPath.path, `${configs.split('/')[0]}/${file}.js`));
    const nested = Object.keys(content).length === 1;
    contentPromises.push(appendConfig(file, content, nested));
  });

  Promise.all(contentPromises).then(() => {
    Object.keys(environmentsDirectories).forEach((env) => {
      if (environmentsDirectories[env]) {
        mkdirp(`${appRootPath.path}/${environmentsDirectories[env]}/`, () => {
          const location = `${appRootPath.path}/${environmentsDirectories[env]}/configuration.js`;
          const content = compiledConfigString[env];
          writeToFile(env, location, content).then(() => { resolve(); });
        });
      }
    });
  });
});

module.exports = {
  processor,
  fetchLast,
  compile,
};
