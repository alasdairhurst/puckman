const path = require('path');
const fs = require('fs');
const npm = require('./npm');

class Install {
	constructor(config) {
		this.config = config;
	}

	install(packageName, linkDependencies) {
		if (!packageName && process.cwd() === this.config.getDirectory()) {
			return this._installAllModules(linkDependencies);
		}
		return this._installModules(packageName, linkDependencies);
	}

	_linkModules(packageName) {
		return Promise.all(this.config.getRelatedModules(packageName).map(dependency => {
			return npm.link(dependency);
		}));
	}

	_unlinkModules(packageName) {
		return Promise.all(this.config.getRelatedModules(packageName).map(dependency => {
			return npm.uninstall(dependency);
		}));
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
