import inquirer from 'inquirer';
import TreePrompt from '../index.js';
import path from 'node:path';
import fs from 'node:fs/promises';

inquirer.registerPrompt('tree', TreePrompt);

const directoriesOnly = false;

function createDirectoryLister(dir) {
	return async () => {
		return (await fs.readdir(dir, { withFileTypes: true }))
		.filter((item) => !directoriesOnly || item.isDirectory())
		.map((item) => {
			const isDirectory = item.isDirectory();
			const resolved = path.resolve(dir, item.name)

			return {
				name: item.name,
				value: resolved + (isDirectory ? path.sep : ''),
				children: isDirectory ? createDirectoryLister(resolved) : null
			};
		});
	};
}

inquirer
  .prompt([
    {
      type: 'tree',
      name: 'file',
      loop: false,
      message: 'Choose an item:',
      tree: createDirectoryLister(process.cwd()),
		validate: (resolved) => path.basename(resolved)[0] !== '.',
      // onlyShowValid: true,
      // hideChildrenOfValid: true
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers))
  });
