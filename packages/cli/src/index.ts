#!/usr/bin/env node

import { list, upload, download, remove } from "./commands/files.js";
import { checkAuth, getAuthConfig } from "./utils/auth.js";
import { login } from "./commands/auth.js";
import { Command } from "commander";
import chalk from "chalk";

const program = new Command();

program.name("nimbus").description("Nimbus CLI - Manage your files from the command line").version("0.1.0");

// Auth commands
program.command("login").description("Login to your Nimbus account").action(login);

// File commands
program
	.command("ls")
	.description("List files")
	.option("-p, --path <path>", "Path to list files from", "/")
	.action(async options => {
		await checkAuth();
		await list(options);
	});

program
	.command("upload")
	.description("Upload a file or directory")
	.argument("<path>", "Path to file or directory to upload")
	.option("-d, --dest <destination>", "Destination path", "/")
	.action(async (path, options) => {
		await checkAuth();
		await upload(path, options);
	});

program
	.command("download")
	.description("Download a file or directory")
	.argument("<path>", "Path to file or directory to download")
	.option("-o, --output <output>", "Output path")
	.action(async (path, options) => {
		await checkAuth();
		await download(path, options);
	});

program
	.command("rm")
	.description("Remove a file or directory")
	.argument("<path>", "Path to file or directory to remove")
	.action(async path => {
		await checkAuth();
		await remove(path);
	});

program
	.command("whoami")
	.description("Show the current user")
	.action(async () => {
		await checkAuth();
		const user = getAuthConfig().user;
		console.log(chalk.green(`\nusername: ${user?.name}\nemail: ${user?.email}`));
	});

program.parse();
