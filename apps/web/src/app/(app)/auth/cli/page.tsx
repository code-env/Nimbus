"use client";

import { authClient } from "@nimbus/auth/auth-client";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";
import { useEffect } from "react";

export default function CLIAuthPage() {
	const { data } = authClient.useSession();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");

	useEffect(() => {
		if (data && callbackUrl) {
			// Send auth data back to CLI's local server
			const redirectUrl = new URL(callbackUrl);
			redirectUrl.searchParams.set("token", data.session.token);
			redirectUrl.searchParams.set("refreshToken", data.session.id);
			redirectUrl.searchParams.set("expiresAt", String(data.session.expiresAt));
			redirectUrl.searchParams.set("user", JSON.stringify(data.user));
			// Redirect to CLI callback URL with auth data
			window.location.href = redirectUrl.toString();
		}
	}, [data, callbackUrl]);

	if (!callbackUrl) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold">Invalid Request</h1>
					<p className="mt-2 text-gray-600">Missing callback URL</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Loader className="mx-auto h-8 w-8" />
				<h1 className="mt-4 text-xl font-semibold">Authenticating CLI...</h1>
				<p className="mt-2 text-gray-600">Please wait while we complete the authentication process.</p>
			</div>
		</div>
	);
}
