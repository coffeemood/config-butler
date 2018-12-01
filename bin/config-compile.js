#!/usr/bin/env node
const { compile } = require('../index');

const configs = process.argv[2];
const environments = process.argv[3].split(' ');
const outputDir = process.argv[4] ? process.argv[4].split(' ') : environments;

compile(configs, environments, outputDir);
