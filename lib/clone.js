const git = require('./git');

class Clone {
	constructor(config) {
		this.config = config;
	}

	clone(packageName) {
		if (packageName) {
			return this._clonePackage(packageName);
		}
		return Promise.all(this.config.getModules().map(module => {
			return this._clonePackage(module.name);
		}));
	}

	_clonePackage(packageName) {
		const mod = this.config.getModule(packageName);
		if (!mod) {
			return Promise.reject(`${packageName} does not exist in project config`);
		}
		const cwd = process.cwd();
		if (cwd !== this.config.getDirectory()) {
			process.chdir(this.config.getDirectory());
		}
		return git.clone(packageName, mod.repo)
			.then(() => {
				process.chdir(cwd);
				return Promise.resolve();
			});
	}

}

module.exports = Clone;
