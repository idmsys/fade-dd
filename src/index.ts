//    _______   ___        ___             _         __ 
//   / __/ _ | / _ \___   / _ \_______    (_)__ ____/ /_
//  / _// __ |/ // / -_) / ___/ __/ _ \  / / -_) __/ __/
// /_/ /_/ |_/____/\__/ /_/  /_/  \___/_/ /\__/\__/\__/ 
//                                   |___/              
//
//  FADe Project Source code
//  This program is distributed under MIT License.
//  Copyright (C) ldmsys, All rights reserved.

const fade_version = "Git Version";

import tmpjs from 'tmp';
import copy from 'recursive-copy';
import rls from 'readline-sync';
import {promises as fs} from 'fs';
import rimraf from 'rimraf';
import minimist from 'minimist';
import { args2config, FADeConfiguration, genRunbin, getFADeConfig, isSameOrUndef, openEditor, stubCreateDeb, validate } from './utils';

const args = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        o: 'output',
        i: 'input',
        depend: 'dependency',
        depends: 'dependency',
        'depend-add': 'dependency-add',
        'depend-rm': 'dependency-rm',
        dependancy: 'dependency',
        'depends-add': 'dependency-add',
        'depends-rm': 'dependency-rm',
        deb: 'create-deb',
        desc: 'description',
        arch: 'architecture',
        'input-postinst': 'input-postinst-payload',
        'input-prerm': 'input-prerm-payload',
        'edit-postinst': 'edit-postinst-payload',
        'edit-prerm': 'edit-prerm-payload'
    }
});


async function main() {
    if(typeof args.help !== "undefined") {
        console.log(help(false));
    }else if(typeof args.init !== "undefined") {
        console.log("init");
    }else if(typeof args.edit !== "undefined") {
        edit(args.path, args2config(args), !!args['edit-postinst-payload'], !!args['edit-prerm-payload']);
    }else if(typeof args["create-deb"] !== "undefined") {
        stubCreateDeb(args.path, !!args.host, args.output)
    }else if(args._[0] === "moo" || typeof args.moo !== "undefined") {
        console.error("[FADe] Actually, FADe has Half-cow Powers.");
		console.error("\t\t(__) \n\t\t(oo) \n\t      ---\\/ \n\t\t||   \n\t      --/\\ \n\t\t~~ ");
    }else{
        console.error("[FADe] Invalid or no option given.");
		console.error(help(true));
    }
}

function help(serious_mode: boolean): string {
    return `${!serious_mode?`FADe Project - CLI Edition / ${fade_version} Help
This program is distributed under MIT License.
Copyright (C) ldmsys, All rights reserved.
`:''}
--init [parameters]: Initialize your project.
    --path PATH: Locate your project. [REQUIRED]
    --name PROJECT_NAME: Set your project's name (package manager friendly) [REQUIRED]
    --version VERSION: Set your project's version. [REQUIRED]
    --desc[ription] DESCRIPTION: Set your project's description [REQUIRED]
    --cmdline CMDLINE: Set your project's run command. [REQUIRED]
    --maintainer-name MAINTAINTER_NAME: Set maintainer's name. [REQUIRED]
    --maintainer-email MAINATINER_EMAIL: Set maintainer's email. [REQUIRED]
    --type [service, isolated, normal] : Set project's type. See docs. [REQUIRED]
    --depend[ency] DEPENDENCY: Set project's dependency. [REQUIRED, MULTIPLE]
    --url URL: Set project's official website. Default is "https://example.com/"
    --priority PRIORITY: Set project's priority. Default is "optional"
    --arch[itecture] ARCHITECTURE: Set project's architecture. Default is "all"
    --blacklist BLACKLIST[/]: Exclude specific file or directory from build (Note that blacklisting a directory requires end with '/') [MULTIPLE]
    --i[nput] FILENAME: Despite above parameters, use specific fade.json to configure your project.
--edit [parameters]: Edit your project's configuration with --init's parameters. Additional parameters:
    --edit-postinst[-payload]: Edit Post-Install Script's payload with your preferred editor.
    --edit-prerm[-payload]: Edit Pre-Remove Script's payload with your preffered editor.
    --i[nput] filename: No effect due to compatibility issues.
    --prerm-payload: No effect due to compatibility issues.
    --postinst-payload: No effect due to compoatibility issues.
    --depend[ency]: No effect.
    --depend[ency]-add: Add dependency to your project. [MULTIPLE]
    --depend[ency]-rm: Remove dependency from your project. [MULTIPLE]
    --blacklist: No effect.
    --blacklist-add: Add blacklist to your project. [MULTIPLE]
    --blacklist-rm: Remove Blacklist from your project. [MULTIPLE]
--[create-]deb [parameters]: Create .deb in order to install your project to debian-based systems
    --path PATH: Locate your project. [REQUIRED]
    --o[utput] OUTPUT: Change output deb, Default is "name_version_arch.deb" on current directory.
    --host: Host binary to the network instead of writing to file.
--h[elp]: Show this help message.
${!serious_mode?`\n\tMaybe this FADe has Super Cow Powers...?`:''}`;
}

async function edit(path: string, requested: FADeConfiguration, editPostinst?: boolean, editPrerm?: boolean) {
    await validate(path);
    let data = await getFADeConfig(path);
    /* Generated by
    ['name', 'version', 'desc', 'url', 'architecture', 'depends', 'priority', 'run', 'maintainer_name', 'maintainer_email', 
    'postinst_payload', 'prerm_payload', 'blacklist'].forEach(item => {
        console.log(`isSameOrUndef(data.${item}, requested.${item}) ? undefined: data.${item} = requested.${item};`);
    });
    */
    isSameOrUndef(data.name, requested.name) ? undefined: data.name = requested.name;
    isSameOrUndef(data.version, requested.version) ? undefined: data.version = requested.version;
    isSameOrUndef(data.desc, requested.desc) ? undefined: data.desc = requested.desc;
    isSameOrUndef(data.url, requested.url) ? undefined: data.url = requested.url;
    isSameOrUndef(data.architecture, requested.architecture) ? undefined: data.architecture = requested.architecture;
    isSameOrUndef(data.depends, requested.depends) ? undefined: data.depends = requested.depends;
    isSameOrUndef(data.priority, requested.priority) ? undefined: data.priority = requested.priority;
    isSameOrUndef(data.run, requested.run) ? undefined: data.run = requested.run;
    isSameOrUndef(data.maintainer_name, requested.maintainer_name) ? undefined: data.maintainer_name = requested.maintainer_name;
    isSameOrUndef(data.maintainer_email, requested.maintainer_email) ? undefined: data.maintainer_email = requested.maintainer_email;
    isSameOrUndef(data.postinst_payload, requested.postinst_payload) ? undefined: data.postinst_payload = requested.postinst_payload;
    isSameOrUndef(data.prerm_payload, requested.prerm_payload) ? undefined: data.prerm_payload = requested.prerm_payload;
    isSameOrUndef(data.blacklist, requested.blacklist) ? undefined: data.blacklist = requested.blacklist;
    if(!isSameOrUndef(data.type, requested.type)) {
        data.type = requested.type;
        console.log("[FADe] Type changed. Regenerating runbin...");
        await fs.unlink(`${path}/.fadework/usr/bin/${data.name}`);
        await fs.writeFile(`${path}/.fadework/usr/bin/${data.name}`, genRunbin(data));
    }
    if(editPostinst)
        data.postinst_payload = await openEditor("postinst", data.postinst_payload);
    if(editPrerm)
        data.prerm_payload = await openEditor("prerm", data.prerm_payload);
    await fs.writeFile(`${path}/.fadework/fade.json`, JSON.stringify(data, null, 2))
    console.log("[FADe] Thy amendments were reflected.")
}

function init(path: string, requested: FADeConfiguration) {

}

main();