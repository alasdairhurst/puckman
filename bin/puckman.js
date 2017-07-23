#!/usr/bin/env node

'use strict';

const program = require('commander');
global.logger = require('../lib/logger')(program);

const packageJSON = require('../package.json');
const Loader = require('../lib/loader');
const commands = require('../lib/commands');
const utils = require('../lib/utils');

const loadConfig = () => {
	return Loader.loadConfig()
		.then(config => {
			config.getModules().forEach(mod => {
				Object.keys(mod.scripts).forEach(hook => {
					utils.registerHook(mod.name, hook, mod.scripts[hook]);
				});
			});
			return Promise.resolve(config);
		});
};
program
	.version(packageJSON.version);

program
	.command('clone [module]')
	.alias('c')
	.action((moduleName) => {
		loadConfig()
			.then(config => {
				return commands.clone(config, moduleName);
			})
			.catch(err => {
				logger.error(err.message ? err.message : err);
			});
	});

program
	.command('install [module]')
	.alias('i')
	.action((moduleName) => {
		loadConfig()
			.then(config => {
				return commands.install(config, moduleName);
			})
			.catch(err => {
				logger.error(err.message ? err.message : err);
			});
	});

program.parse(process.argv);

