import { setAuthConfig } from "../utils/auth.js";
import { createServer } from "http";
import chalk from "chalk";
import { URL } from "url";
import open from "open";

const CALLBACK_PORT = 54321;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}`;
const FRONTEND_URL = "http://localhost:3000";

export async function login() {
	console.log(chalk.blue("Opening browser for authentication..."));

	// Create a local server to receive the auth callback
	const server = createServer(async (req, res) => {
		try {
			const url = new URL(req.url!, `http://${req.headers.host}`);
			const token = url.searchParams.get("token");
			const refreshToken = url.searchParams.get("refreshToken");
			const expiresAt = url.searchParams.get("expiresAt");
			const user = url.searchParams.get("user");
			if (token && refreshToken && expiresAt) {
				setAuthConfig({
					token,
					refreshToken,
					expiresAt: parseInt(expiresAt),
					user: JSON.parse(user!),
				});

				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(`
          <html>
            <body>
              <h1>Successfully authenticated!</h1>
              <p>You can now close this window and return to the terminal.</p>
              <script>window.close()</script>
            </body>
          </html>
        `);

				server.close();
				console.log(chalk.green("Successfully logged in! You can now use the CLI."));
				process.exit(0);
			} else {
				throw new Error("Invalid authentication response");
			}
		} catch (error) {
			console.error(chalk.red("Authentication failed:"), error);
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end("Authentication failed");
			server.close();
			process.exit(1);
		}
	});

	// Start the server
	server.listen(CALLBACK_PORT, async () => {
		// Open the browser for authentication
		await open(`${FRONTEND_URL}/auth/cli?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`);
	});

	// Handle server errors
	server.on("error", error => {
		console.error(chalk.red("Server error:"), error);
		process.exit(1);
	});

	console.log(chalk.yellow("Waiting for authentication..."));
}
