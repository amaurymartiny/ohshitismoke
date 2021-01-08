/**
 * @file	Merging Translation Namespace
 * @author	ngdangtu (twitter)
 *
 * From the project root, run:
 * 		node scripts/packTranslations.js
 *
 * TODO do not overwrite the old translation, rename those.
 */
const {
	readFileSync,
	readdirSync,
	existsSync,
	writeFile,
	mkdirSync,
	rmdir,
	promises
} = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..', 'App', 'localization');
const SRC = join(ROOT, 'raw-src');
const DEST = join(ROOT, 'languages');
const NAME = /([a-zA-Z-]{2,5})@([\w-]+)(?=\.json)/i; // regexr.com/5dud0

const MSG = {};

MSG.errors = {
	file_not_found: 'Translation files not found!',
};
MSG.instruction = {};
MSG.tasks = {
	merge_complete: (lang) => `Merging ${lang} language is completed.`,
	clean_up_complete: (target) => `[${target}] is deleted!`,
};

const mergeOldFile = async () => {
	const backupDir = `${DEST}.old`
	const newDir = DEST

	/**
	 * TODO check for dead keys and remove them
	 */
	const files = readdirSync(newDir).map(async (lang) => {
		const newFile = join(newDir, lang)
		const newLang = readFileSync(newFile)
		const bakLang = readFileSync(join(backupDir, lang))
		const mergedLang = {
			...JSON.parse(newLang),
			...JSON.parse(bakLang)
		}
		return promises.writeFile(
			newFile,
			JSON.stringify(mergedLang, null, 2)
		)
	})

	return Promise.all(files)
};

const cleanUp = (target) => {
	const handler = (error) => {
		if (error) throw error;
		else console.log(MSG.tasks.clean_up_complete(target));
	};
	rmdir(target, { recursive: true }, handler);
};

const loadNamespace = (name) => {
	const nsFile = join(SRC, `${name}.json`);
	const data = readFileSync(nsFile);
	return JSON.parse(data);
};

const mergeNamespaces = ({ name, nsMap }) =>
	new Promise((res, rej) => {
		const mergedFileName = join(DEST, `${name}.json`);
		const mergedFile = {};

		for (const { ns, name } of nsMap) {
			mergedFile[ns] = loadNamespace(name);
		}

		const handleWriteFile = (err) => {
			if (err) rej(err);
			else res(MSG.tasks.merge_complete(name));
		};
		writeFile(
			mergedFileName,
			JSON.stringify(mergedFile, null, 2),
			handleWriteFile
		);
	});

const backup = async (dir) => {
	const backupDest = `${dir}.old`
	if (!existsSync(backupDest)) mkdirSync(backupDest)

	const files = readdirSync(dir).map(async (file) => {
		const backupFile = join(dir, file)
		const backupDestFile = join(backupDest, file)
		return promises.copyFile(backupFile, backupDestFile)
	})

	return Promise.all(files)
};

const secureDestDir = async () => {
	if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });
	else backup(DEST)
};

const exportAll = async (maps) => {
	const processes = [];

	await secureDestDir();
	for (const lang in maps) {
		const params = { name: lang, nsMap: maps[lang] };
		const process = mergeNamespaces(params);
		processes.push(process);
	}

	return Promise.allSettled(processes);
};

const Scanner = {};

Scanner.getLangMap = (files) => {
	let list = {};
	for (const { code, ns, name } of files) {
		const meta = { ns, name };
		if (!list[code]) list[code] = [meta];
		else list[code].push(meta);
	}
	return list;
};

Scanner.filterFiles = (fsDirents) =>
	fsDirents
		.filter((fsDirent) => {
			const isFile = fsDirent.isFile();
			const isTraslatedFile = NAME.test(fsDirent.name);
			return isFile && isTraslatedFile;
		})
		.map((file) => {
			const filename = file.name.match(NAME);
			return {
				name: filename[0],
				code: filename[1],
				ns: filename[2],
			};
		});

Scanner.scan = () => {
	const options = { withFileTypes: true };

	const dirents = readdirSync(SRC, options);
	const validFiles = Scanner.filterFiles(dirents);

	if (!validFiles) throw new Error(MSG.errors.file_not_found);
	else return Scanner.getLangMap(validFiles);
};

const println = (array) => array.forEach((item) => console.log(item));

(async (flags) => {
	const langMap = Scanner.scan();
	const jobs = await exportAll(langMap);

	if (flags.length > 0 && flags.includes('-c')) cleanUp(SRC);
	if (flags.length > 0 && flags.includes('-m')) await mergeOldFile();
	return jobs.map((job) => (job.value ? job.value : job.reason));
})(process.argv.slice(2))
	.then(println)
	.catch(console.error);
