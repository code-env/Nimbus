import api from "../utils/api.js";
import fs from "fs/promises";
import chalk from "chalk";
import path from "path";

interface FileItem {
	id: string;
	name: string;
	type: "folder" | "document" | "image" | "video";
	size?: string;
	modified: string;
}

export async function list({ path: filePath = "/" }: { path?: string }) {
	try {
		const response = await api.get<FileItem[]>(`/api/files?path=${encodeURIComponent(filePath)}`);
		const files = response.data;

		if (files.length === 0) {
			console.log(chalk.yellow("No files found"));
			return;
		}

		console.log(chalk.blue(`\nListing files in ${filePath}:`));
		console.log(chalk.dim("─".repeat(50)));

		files.forEach(file => {
			const icon = file.type === "folder" ? "📁" : "📄";
			const size = file.size ? `(${file.size})` : "";
			console.log(`${icon} ${chalk.white(file.name)} ${chalk.dim(size)}`);
		});

		console.log(chalk.dim("─".repeat(50)));
	} catch (error) {
		console.error(chalk.red("Failed to list files:"), error);
		process.exit(1);
	}
}

export async function upload(filePath: string, { dest = "/" }: { dest?: string }) {
	try {
		const stats = await fs.stat(filePath);
		const fileName = path.basename(filePath);

		if (stats.isDirectory()) {
			console.log(chalk.yellow("Directory upload is not yet supported"));
			return;
		}

		const fileContent = await fs.readFile(filePath);
		const formData = new FormData();
		formData.append("file", new Blob([fileContent]), fileName);
		formData.append("path", dest);

		console.log(chalk.blue(`Uploading ${fileName} to ${dest}...`));

		await api.post("/api/files/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		console.log(chalk.green("Upload complete!"));
	} catch (error) {
		console.error(chalk.red("Failed to upload file:"), error);
		process.exit(1);
	}
}

export async function download(filePath: string, { output }: { output?: string }) {
	try {
		const fileName = path.basename(filePath);
		const outputPath = output || fileName;

		console.log(chalk.blue(`Downloading ${filePath}...`));

		const response = await api.get(`/api/files/download?path=${encodeURIComponent(filePath)}`, {
			responseType: "arraybuffer",
		});

		await fs.writeFile(outputPath, response.data);
		console.log(chalk.green(`Downloaded to ${outputPath}`));
	} catch (error) {
		console.error(chalk.red("Failed to download file:"), error);
		process.exit(1);
	}
}

export async function remove(filePath: string) {
	try {
		console.log(chalk.yellow(`Are you sure you want to delete ${filePath}?`));
		// TODO: Add confirmation prompt

		await api.delete(`/api/files?path=${encodeURIComponent(filePath)}`);
		console.log(chalk.green("File deleted successfully"));
	} catch (error) {
		console.error(chalk.red("Failed to delete file:"), error);
		process.exit(1);
	}
}
