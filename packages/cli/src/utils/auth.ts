import chalk from "chalk";
import Conf from "conf";

const config = new Conf({
	projectName: "nimbus-cli",
});

interface AuthConfig {
	token?: string;
	refreshToken?: string;
	expiresAt?: number;
	user?: User;
}

interface User {
	name: string;
	id: string;
	email: string;
}

export function getAuthConfig(): AuthConfig {
	return {
		token: config.get("token") as string | undefined,
		refreshToken: config.get("refreshToken") as string | undefined,
		expiresAt: config.get("expiresAt") as number | undefined,
		user: config.get("user") as User | undefined,
	};
}

export function setAuthConfig(authConfig: AuthConfig) {
	if (authConfig.token) {
		config.set("token", authConfig.token);
	}
	if (authConfig.refreshToken) {
		config.set("refreshToken", authConfig.refreshToken);
	}
	if (authConfig.expiresAt) {
		config.set("expiresAt", authConfig.expiresAt);
	}
	if (authConfig.user) {
		config.set("user", authConfig.user);
	}
}

export function clearAuthConfig() {
	config.clear();
}

export async function checkAuth() {
	const { token, expiresAt } = getAuthConfig();

	if (!token) {
		console.error(chalk.red("You are not logged in. Please run 'nimbus login' first."));
		process.exit(1);
	}

	if (expiresAt && Date.now() >= expiresAt) {
		console.error(chalk.red("Your session has expired. Please run 'nimbus login' again."));
		process.exit(1);
	}
}
