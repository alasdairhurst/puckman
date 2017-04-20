#!/usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const os = require('os');
const prompt = require('inquirer').createPromptModule();
const packageJSON = require('../package.json');
const Loader = require('../lib/loader');
const logger = require('../lib/logger')(program);

const conf = Loader.loadConfig();

const projectConfigName = '.pmconf';
const projectDBName = '.pmdb';

program
	.version(packageJSON.version);

const exit = (error, code) => {
	logger.error(error);
	process.exit(code || 1);
};

const getDB = () => {
	const projectDBPath = path.resolve(os.homedir(), projectDBName);
	if (fs.existsSync(projectDBPath)) {
		let db = fs.readFileSync(projectDBPath);
		try {
			db = JSON.parse(db);
		} catch (e) {
			logger.error(e);
		}
		return db;
	}
	return {};
};

const db = getDB();

const writeDB = () => {
	const projectDBPath = path.resolve(os.homedir(), projectDBName);
	fs.writeFileSync(projectDBPath, JSON.stringify(db, '', 2));
};

const getProjects = () => {
	if (!db.projects) {
		return [];
	}
	return db.projects;
};

const addProject = (project) => {
	if (!db.projects) {
		db.projects = [];
	}
	db.projects.push(project);
};

const getProjectsByPath = (p) => {
	return getProjects().filter((project) => {
		return project.path && project.path === p;
	});
};

const getProjectsByName = (name) => {
	return getProjects().filter((project) => {
		return project.name && project.name === name;
	});
};

const validatedPrompt = (questions, validate) => {
	return new Promise((resolve, reject) => {
		return prompt(questions)
			.then((answer) => {
				if (!validate || (typeof validate === 'function' && validate(answer))) {
					return resolve(answer);
				}
				return reject();
			});
	});
};

const isNodeModule = () => {
	return fs.existsSync(path.resolve(process.cwd(), 'package.json'));
};

// addProject
program
	.command('init')
	.alias('i')
	.option('-f, --force <force>', 'overwrite existing project')
	.option('-p, --project <projectName>', 'project name')
	.action((options) => {
		const existingProjects = getProjectsByPath(process.cwd());

		// check if folder is already managed
		if (!options.force && options.projectName && getProjectsByName(options.projectName).length) {
			exit(`Project already exists with the name ${options.projectName}. Use a different name or try again with --force`);
		}

		if (isNodeModule()) {
			exit('Cannot initialise project in a node module');
		}

		new Promise((resolve, reject) => {
			// make sure directory is ok
			if (options.force || !existingProjects.length) {
				return resolve();
			}
			return validatedPrompt({
				type: 'confirm',
				name: 'force',
				message: 'One or more projects already exist in this directory. Do you want to continue?'
			}, (answer) => { return answer.force; })
				.then(resolve, reject);
		})
			.then(() => {
			// Get project name
				if (options.projectName) {
					return Promise.resolve(options.projectName);
				}
				return validatedPrompt({
					type: 'input',
					name: 'projectName',
					message: 'What is the name of the project?'
				}, (answer) => { return answer.projectName; });
			})
			.then((projectName) => {
			// make project
				const project = {
					path: process.cwd(),
					name: projectName
				};
				addProject(project);
				writeDB();
			}, () => {
				console.log('reject');
			})
			.catch((err) => {
				exit(err);
			});
	});

	// addModuleToProject
program
	.command('add')
	.alias('a')
	.option('-f, --force <force>', 'overwrite existing project')
	.option('-p, --project <projectName>', 'project name')
	.action((options) => {

	});


	// addProject
	// addModuleToProject
	// removeModuleFromProject
	// removeProject
	// addLinkedDependency
	// removeLinkedDependency
	// setAction -m <module> <actionName> (install, update, fetch etc...) <action>
	// -- actions have wildcards for project/module details like name/repo/path ---
	// install / -p <name>
	// update / -p <name>
	// reinstall / -p <name>
	// exportProject /-p <name> -f <file>
	// importProject (ask for location)
	// addHook -h <hook> (beforeInstall, afterInstall etc...) <action> (git status) / -p <name>
	// removeHook -h <hook> / -p <name>

const getProjectConfig = (file) => {
	let projectConfigPath;
	if (file && path.isAbsolute(file)) {
		projectConfigPath = file;
	} else if (file) {
		projectConfigPath = path.resolve(process.cwd(), file);
	}	else {
		projectConfigPath = path.resolve(process.cwd(), projectConfigName);
	}
	
	if (fs.existsSync(projectConfigPath)) {
		let projectConfig;
		try {
			projectConfig =	require(projectConfigPath);
		} catch (e) {
			return exit(e);
		}
		// TODO: validate config

		return projectConfig;
	} else if (file) {
		exit(`config ${projectConfigPath} could not be found`);
	}
};


program
	.command('setupExample [project]')
	.alias('s')
	.option('-f, --force [force]', 'force setup')
	.option('-r, --registry [registry]', 'npm registry to use')
	.option('-c, --config <config>', 'path to project configuration')
	.action((project, options) => {
		const config = getProjectConfig(options.config);

		if (project) {
			// look for am-config-project module in global npm

			if (config) {
				// look for project inside config
			}
		}

		if (config) {

		}

		// if folder is node module - fails
		if (isNodeModule()) {
			return exit('setup cannot be run inside a node module');
		}

		if (options.force) {
			// if .amconf does not exist - fails
			if (!config) {
				return exit('Unknown project');
			}

			// requires confirmation that project directories that already exist will be wiped
			const confirm = true;
			if (!confirm) {
				
			}
			// wipe all project directories
		} else {
			// if !options.force
			// if folder already has .amconf - fails
			// if project is unknown not set - fails
			// if project has modules which has directories which already exist - fails
			// saves .amconf describing the project in directory
			//   - project
			//      - path
			//      - modules in use
		}

		// clones all modules for project (parallel)
		// installs all modules (parallel)
		// links all modules together (series)
	});

program.parse(process.argv);
