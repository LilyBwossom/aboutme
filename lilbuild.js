const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { exec } = require('child_process');
const chalk = require('chalk').default;

const sourceDir = path.join(__dirname, 'source');
const buildDir = path.join(__dirname, 'build');
const staticDir = path.join(__dirname, 'static');
const tempDir = path.join(__dirname, 'temp');

let buildIgnoreCache = null;
const buildIgnoreDir = path.join(__dirname, '.buildignore');

// flags
lossy_compression = false;
skip_webp = false;

// async version of exec
function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
}

// abort the build process
function abort() {
    LogMakeup.error("Build process aborted.", null, false);
    process.exit(1);
}

class LogMakeup {
    static error(text, error, doAbort = true) {
        const processedText = chalk.red(`⚠  ${text}`);
        if (!error) {
            console.error(processedText);
        } else {
            console.error(processedText, "\n   " + chalk.red(error));
        }

        if (doAbort) {
            abort();
        }
    }

    static success(text) {
        console.log(chalk.green(`✓ ${text}`));
    }

    static info(text) {
        console.log(chalk.gray(`🛈 ${text}`));
    }
}

// converts a path to a relative path (mostly used for logging)
function relPath(itemPath) {
    return path.relative(__dirname, itemPath);
}

// check if an item is in the ignore list
function isIgnored(itemPath) {
    itemPath = relPath(itemPath);

    if (buildIgnoreCache === null) { return false; }

    for (const line of buildIgnoreCache) {
        let ignores = line.split('*');

        // "text" - exact match
        if (ignores.length === 1) {
            if (itemPath === ignores[0]) return true;
        }
        // with asterix
        else if (ignores.length === 2) {
            const [start, end] = ignores;

            // "*end" - ends with
            if (line.startsWith('*') && itemPath.endsWith(end)) return true;

            // "start*" - starts with  
            if (line.endsWith('*') && itemPath.startsWith(start)) return true;

            // "start*end" - starts and ends with
            if (itemPath.startsWith(start) && itemPath.endsWith(end)) return true;
        }
    }
    return false;
}

// cache the contents of the ignore list
async function readIgnoreList(verbose = true) {
    if (verbose) {
        LogMakeup.info(`Reading build ignore list...`);
    }

    if (await fs.exists(buildIgnoreDir)) {
        try {
            const ignoreString = await fs.readFile(buildIgnoreDir, 'utf8');
            const lines = ignoreString.split(/\r?\n/); // handle both unix and windows line breaks

            let ignoreList = [];
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine === '' || trimmedLine.startsWith('//')) {
                    continue;
                }

                if (trimmedLine.split('*').length > 2) {
                    LogMakeup.error(`Ignore statement can't contain more than one *: ${trimmedLine}`);
                }

                ignoreList.push(trimmedLine);
            }

            if (verbose) {
                LogMakeup.success(`Succesfully read build ignore list: ${relPath(buildIgnoreDir)}`);
            }
            return ignoreList;
        } catch (error) {
            LogMakeup.error(`Error reading build ignore ${buildIgnoreDir}:`, error);
        }
    } else {
        return null;
    }
}

// check if a directory or file is safe to modify/delete
async function checkIfItemSafe(item) {
    // get the absolute path of the item
    const itemPath = path.resolve(item);

    // check if build and temp directories are within the project directory
    const buildInProject = buildDir.startsWith(__dirname + path.sep);
    const tempInProject = tempDir.startsWith(__dirname + path.sep);

    // check if the item is within the build or temp directory
    const isInBuild = itemPath.startsWith(buildDir + path.sep) || itemPath === buildDir;
    const isInTemp = itemPath.startsWith(tempDir + path.sep) || itemPath === tempDir;

    if (!buildInProject || !tempInProject || (!isInBuild && !isInTemp)) {
        LogMakeup.error(`Item is not safe to modify: ${item}`);
    }
}

// deletes a file
async function deleteItem(itemPath, verbose = true) {
    await checkIfItemSafe(itemPath);

    const stats = fs.statSync(itemPath);
    const type = stats.isDirectory ? 'directory' : 'file';
    if (verbose) {
        LogMakeup.info(`Deleting ${type}: ${relPath(itemPath)}...`);
    }

    try {
        await fs.rm(itemPath, { recursive: true });

        if (verbose) {
            LogMakeup.success(`Succesfully deleted ${type}: ${relPath(itemPath)}`);
        }
    } catch (error) {
        LogMakeup.error(`Error deleting file ${itemPath}:`, error);
    }
}

// clear a directory
async function clearDirectory(dirPath, verbose = true) {
    await checkIfItemSafe(dirPath);

    if (verbose) {
        LogMakeup.info(`Clearing directory ${relPath(dirPath)}...`);
    }

    try {
        await fs.emptyDir(dirPath);
        if (verbose) {
            LogMakeup.success(`Succesfully cleared directory: ${relPath(dirPath)}`);
        }
    } catch (error) {
        LogMakeup.error(`Error clearing directory ${dirPath}:`, error);
    }
}

// copy the contents of one directory to another
// or a file to another file location
async function copyItem(pathFrom, pathTo, verbose = true, checkIgnore = false) {
    await checkIfItemSafe(pathTo);

    if (verbose) {
        LogMakeup.info(`Copying ${relPath(pathFrom)} to ${relPath(pathTo)}...`);
    }

    try {
        await fs.copy(pathFrom, pathTo, {
            overwrite: true,
            errorOnExist: false,
            filter: (src) => {
                return !isIgnored(src) || !checkIgnore;
            }
        });
        if (verbose) {
            LogMakeup.success(`Succesfully copied ${relPath(pathFrom)} to ${relPath(pathTo)}`);
        }
    } catch (error) {
        LogMakeup.error(`Error copying file / directory ${pathFrom} to ${pathTo}: `, error);
    }
}

// apply these postcss plugins to a file
// https://github.com/postcss/autoprefixer
// https://github.com/cuth/postcss-pxtorem
// https://github.com/csstools/postcss-short
// https://github.com/postcss/postcss-mixins
// https://github.com/postcss/postcss-nested
async function applyPostCSS(filePath) {
    const file = path.basename(filePath);
    const outputFile = path.join(tempDir, file);

    try {
        // use PostCSS CLI to process the file
        await execAsync(`npx postcss ${filePath} -o ${outputFile}`, {
            stdio: 'inherit'
        });
        LogMakeup.success(`Succesfully applied postcss to: ${relPath(filePath)}`);

        // copy the processed file to the build directory
        await copyItem(outputFile, filePath, false);
    } catch (error) {
        LogMakeup.error(`Failed to apply postcss to: ${filePath}`, error.message);
    }
}

// convert images to webp
async function convertAsset(filePath) {
    // changes the file extension
    const outputFile = `${filePath.substr(0, filePath.lastIndexOf("."))}.webp`;

    try {
        // read the file as a buffer to prevent file locking
        const assetBuffer = await fs.readFile(filePath);

        await sharp(assetBuffer, {
            animated: true
        }).webp({
            smartDeblock: !lossy_compression, // prod -> true
            minSize: !lossy_compression, // prod -> true
            effort: lossy_compression ? 4 : 6 // the higher the effort the smaller the file | prod -> 6
        }).toFile(outputFile);

        LogMakeup.success(`Successfully converted to WebP: ${relPath(filePath)}`);

        // delete the old file
        await deleteItem(filePath, false);
    } catch (error) {
        LogMakeup.error(`Failed to convert to WebP: ${filePath}`, error.message);
    }
}

// applies the callback to files with a
// certain extension in a specific directory
async function applyToFiles(dirPath, exts, callback) {
    try {
        const items = await fs.readdir(dirPath);
        var callbacks = [];

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
                // process subdirectory
                callbacks.push(applyToFiles(itemPath, exts, callback));
            } else if (stats.isFile()) {
                // process file
                if (exts === null || exts.some(ext => item.toLowerCase().endsWith(ext))) {
                    callbacks.push(callback(itemPath));
                }
            }
        }

        // run all the callbacks
        await Promise.all(callbacks);
    } catch (error) {
        LogMakeup.error(`Error reading directory ${dirPath}: `, error);
    }
}

// check if source, build, static and temp directories exist
if (!fs.existsSync(sourceDir) || !fs.existsSync(buildDir) || !fs.existsSync(staticDir) || !fs.existsSync(tempDir)) {
    LogMakeup.error(`One or more directories do not exist: ${sourceDir}, ${buildDir}, ${staticDir} or ${tempDir} `);
}

// check if source directory is not empty
if (fs.readdirSync(sourceDir).length === 0) {
    LogMakeup.error(`Source directory is empty: ${sourceDir} `);
}

// main function
async function main() {
    LogMakeup.info(`Starting build...`);
    buildIgnoreCache = await readIgnoreList(buildIgnoreDir);

    await copyItem(sourceDir, buildDir, true, true);

    // moves all pages outside of the pages directory
    await copyItem(path.join(buildDir, 'pages'), buildDir);
    await deleteItem(path.join(buildDir, 'pages'), false);

    LogMakeup.info(`Applying postcss...`);
    if (skip_webp) { LogMakeup.info(`Converting assets...`); }
    await Promise.all([
        applyToFiles(buildDir, ['.css'], applyPostCSS),
        skip_webp ? Promise.resolve() :
            applyToFiles(buildDir, ['.png', '.jpg', '.jpeg', '.gif'], convertAsset)
    ]);

    // only copy if there are files in the static directory
    if (fs.readdirSync(staticDir).length > 0) {
        await copyItem(staticDir, buildDir, true, true);
    } else {
        LogMakeup.info(`Skipping copying of static directory, because it is empty: ${relPath(staticDir)} `);
    }

    await clearDirectory(tempDir);
    LogMakeup.success(`Succesfully completed build!!`);
}

// parse command line arguments
const args = process.argv.slice(2);
let addDivider = false;
args.forEach(arg => {
    switch (arg) {
        case '--lossy':
        case '-l':
            LogMakeup.info(`Enabled lossy compression`);
            lossy_compression = true;
            addDivider = true;
            break;
        case '--no-webp':
        case '-nw':
            LogMakeup.info(`Skipping asset conversion`);
            skip_webp = true;
            addDivider = true;
            break;
    }
});
if (addDivider) { console.log(''); }

// call the main function
(async () => await main())();