#!/usr/bin/env node

'use strict';

const program = require('commander');
global.logger = require('../lib/logger')(program);

const packageJSON = require('../package.json');
const Loader = require('../lib/loader');
const commands = require('../lib/commands');
const utils = require('../lib/utils');

Loader.loadConfig()
	.then(config => {
		config.getModules().forEach(mod => {
			Object.keys(mod.scripts).forEach(hook => {
				utils.registerHook(mod.name, hook, mod.scripts[hook]);
			});
		});

		program
			.version(packageJSON.version);

		program
			.command('clone [module]')
			.alias('c')
			.action((moduleName) => {
				commands.clone(config, moduleName);
			});

		program
			.command('install [module]')
			.alias('i')
			.action((moduleName) => {
				commands.install(config, moduleName);
			});

		program.parse(process.argv);
	})
	.catch(err => {
		logger.error(err.message ? err.message : err);
	});
