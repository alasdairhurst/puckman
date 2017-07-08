
const path = require('path');

class Config {
	constructor(config, location) {
		this.config = config;
		this.location = location;
	}

	getDirectory() {
		return this.location;
	}

	getRegistry() {
		return this.config.registry;
	}

	getName() {
		return this.config.name;
	}

	getModules() {
		return this.config.modules;
	}

	getModule(packageName) {
		return this.config.modules.find(p => {
			return p.name === packageName;
		});
	}

	getDependencies(packageName) {
		const packageJSON = require(path.join(this.location, packageName, 'package.json'));
		const deps = Object.keys(packageJSON.dependencies || {});
		const devDeps = Object.keys(packageJSON.devDependencies || {});
		const peerDeps = Object.keys(packageJSON.peerDependencies || {});
		const optionalDeps = Object.keys(packageJSON.optionalDependencies || {});
		return deps.concat(devDeps).concat(peerDeps).concat(optionalDeps);
	}

	getRelatedModules(packageName) {
		const dependencies = this.getDependencies(packageName);
		return dependencies.filter(dependency => {
			return this.getModule(dependency);
		});
	}
}

module.exports = Config;
