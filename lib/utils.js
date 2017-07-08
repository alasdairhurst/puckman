const childProcess = require('child_process');

const spawn = (command) => {
	return new Promise((resolve, reject) => {
		const child = childProcess.spawn(command, { shell: true });
		if (!child) {
			reject(new Error('child not created'));
		}
		child.stdout.on('data', data => {
			if (data.toString()) {
				console.info(data.toString().trim());
			}
		});
		child.stderr.on('data', data => {
			if (data.toString()) {
				console.error(data.toString().trim());
			}
		});
		child.on('close', code => {
			if (code) {
				return reject(`Process exited with error code ${code}`);
			}
			return resolve();
		});
	});
};

let instance;

class HookManager {
	constructor() {
		this.hooks = {};
	}

	static instance() {
		if (!instance) {
			instance = new HookManager();
		}
		return instance;
	}

	registerHook(packageName, id, command) {
		this.hooks[packageName] = this.hooks[packageName] || {};
		this.hooks[packageName][id] = command;
		logger.verbose(`Registered ${id} hook for ${packageName}`);
	}

	getHook(packageName, id) {
		return this.hooks[packageName] && this.hooks[packageName][id.toLowerCase()];
	}

	executeHook(packageName, id) {
		const hook = this.getHook(packageName, id);
		if (!hook) {
			return Promise.resolve();
		}
		logger.info(`executing ${id} hook for ${packageName}: ${hook}`);
		return spawn(hook);
	}
}

const registerHook = (packageName, id, command) => {
	HookManager.instance().registerHook(packageName, id, command);
};

const runCommand = (command, logPassthrough) => {
	if (typeof command === 'string') {
		return spawn(command, logPassthrough);
	} else if (command) {
		return command();
	} else {
		return Promise.resolve();
	}
};

const execute = (id, packageName, command, preCommand, postCommand, logPassthrough) => {
	return HookManager.instance().executeHook(packageName, `pre${id}`)
		.then(() => {
			runCommand(preCommand);
		})
		.then(() => {
			logger.info('execute', command, process.cwd());
			return runCommand(command, logPassthrough);
		})
		.then(() => {
			runCommand(postCommand);
		})
		.then(() => {
			return HookManager.instance().executeHook(packageName, `post${id}`);
		});
};

module.exports = {
	spawn: spawn,
	execute: execute,
	registerHook: registerHook
};
