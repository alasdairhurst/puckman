const path = require('path');
const fs = require('fs');
const npm = require('./npm');

class Install {
	constructor(config) {
		this.config = config;
	}

	install(packageName, linkDependencies) {
		if (!packageName) {
			packageName = this.config.getCurrentModule();
		}

		if (packageName) {
			return this._installModules(packageName, linkDependencies);
		} else if (process.cwd() === this.config.getDirectory()) {
			return this._installAllModules(linkDependencies);
		} else {
			return Promise.reject('Could not install. Unknown directory.');
		}
	}

	_linkModules(packageName) {
		return Promise.all(this.config.getRelatedModules(packageName).map(dependency => {
			return npm.link(dependency);
		}));
	}

	_unlinkModules(packageName) {
		const nodeModulePath = path.resolve(this.config.getDirectory(), packageName, 'node_modules');
		logger.info(nodeModulePath);
		let exists = true;
		try {
			// TODO: why does this always exist?
			fs.existsSync(nodeModulePath);
		} catch (e) {
			logger.info(e);
			exists = false;
		}
		logger.info(exists);
		if (!exists) {
			return Promise.resolve();
		} else {
			return Promise.all(this.config.getRelatedModules(packageName).map(dependency => {
				const dependencyPath = path.resolve(nodeModulePath, dependency);
				try {
					fs.existsSync(dependencyPath);
				} catch (e) {
					exists = false;
				}
				if (exists) {
					return npm.uninstall(dependency);
				} else {
					return Promise.resolve();
				}
			}));
		}
	}

	_installModules(packageName) {
		const mod = this.config.getModule(packageName);
		if (!mod) {
			return Promise.reject(`Module ${packageName} does not exist in config.`);
		}
		const isGlobal = process.cwd() === this.config.getDirectory();
		if (isGlobal) {
			if (!fs.existsSync(path.join(process.cwd(), packageName))) {
				return Promise.reject(`Module ${packageName} not found.`);
			} else {
				process.chdir(path.join(process.cwd(), packageName));
			}
		}
		return this._unlinkModules(packageName)
			.then(() => {
				return npm.install(packageName, {
					registry: this.config.getRegistry()
				});
			})
			.then(() => {
				return this._linkModules(packageName);
			})
			.then(() => {
				if (isGlobal) {
					process.chdir(path.resolve(process.cwd(), '..'));
				}
				return Promise.resolve();
			});
	}

	_installAllModules() {
		return this.config.getModules().reduce((prev, moduleInfo) => prev.then(() => {
			return this._installModules(moduleInfo.name);
		}), Promise.resolve());
	}
}

module.exports = Install;
