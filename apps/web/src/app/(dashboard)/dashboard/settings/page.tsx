"use client";

import { type ApiResponse, type DriveProvider } from "@nimbus/shared";
import { LoadingStatePage } from "@/components/loading-state-page";
import { authClient } from "@nimbus/auth/auth-client";
import { useEffect, useState } from "react";
import env from "@nimbus/env/client";
import { toast } from "sonner";

import { useDefaultAccountProvider } from "@/components/providers/default-account-provider";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useUnlinkAccount } from "@/hooks/useUnlinkAccount";
import { protectedClient } from "@/utils/client";

import { ConnectedAccountsSection } from "@/components/settings/connected-accounts-section";
import { SecuritySection } from "@/components/settings/security-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SettingsHeader } from "@/components/settings/header";
import { capitalizeFirstLetter } from "@nimbus/shared";

// TODO(feat): back button in header goes to a callbackUrl

export default function SettingsPage() {
	const { user, accounts, error, isLoading, refreshUser, refreshAccounts } = useUserInfoProvider();
	const { defaultAccountId } = useDefaultAccountProvider();
	const { unlinkAccount } = useUnlinkAccount();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);
	const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);

	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
			setPreviewUrl(user.image || null);
		}
	}, [user]);

	// TODO(feat): change profile image
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSaveProfile = async () => {
		try {
			setIsSaving(true);
			let isUpdated = false;

			if (user?.email !== email) {
				await authClient.changeEmail({
					newEmail: email,
					callbackURL: `${env.NEXT_PUBLIC_FRONTEND_URL}/verify-email`,
				});
				isUpdated = true;
			}

			if (user?.name !== name || user?.image !== previewUrl) {
				await authClient.updateUser({
					name,
					image: previewUrl,
				});
				isUpdated = true;
			}

			if (isUpdated) {
				await refreshUser();
				toast.success("Profile updated successfully");
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDisconnectAccount = async (provider: DriveProvider, accountId: string) => {
		const toastErrorMessage = `Failed to disconnect ${capitalizeFirstLetter(provider)} account. Account ID: ${accountId}`;

		try {
			const response = await unlinkAccount(provider, accountId);
			if (response?.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Disconnected ${capitalizeFirstLetter(provider)} account`);
		} catch (error) {
			console.error(`Failed to disconnect account`, error);
			toast.error(toastErrorMessage);
		}
	};

	const handleSetDefaultAccount = async (provider: DriveProvider, accountId: string) => {
		setIsSettingDefault(accountId);
		const toastErrorMessage = `Failed to set ${capitalizeFirstLetter(provider)} account. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.user.$put({
				json: {
					defaultProviderId: provider,
					defaultAccountId: accountId,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`${capitalizeFirstLetter(provider)} account set as default`);
		} catch (error) {
			console.error("Failed to set default account:", error);
			toast.error(toastErrorMessage);
		} finally {
			setIsSettingDefault(null);
		}
	};

	const handleUpdateAccount = async (
		provider: DriveProvider,
		accountId: string,
		tableAccountId: string,
		nickname: string
	) => {
		const toastErrorMessage = `Failed to update ${capitalizeFirstLetter(provider)} account. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.account.$put({
				json: {
					id: tableAccountId,
					nickname,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`${capitalizeFirstLetter(provider)} account updated`);
		} catch (error) {
			console.error("Failed to update account:", error);
			toast.error(toastErrorMessage);
		}
	};

	if (isLoading || error) {
		return <LoadingStatePage error={error} />;
	}

	return (
		<div className="flex flex-1 flex-col">
			<SettingsHeader
				title="Settings"
				description="Manage your account settings and preferences"
				showBackButton={true}
			/>
			<div className="container mx-auto flex-1 space-y-6 p-6">
				<ProfileSection
					name={name}
					email={email}
					previewUrl={previewUrl}
					onNameChange={setName}
					onEmailChange={setEmail}
					onFileChange={handleFileChange}
					onSave={handleSaveProfile}
					isSaving={isSaving}
				/>

				<ConnectedAccountsSection
					accounts={accounts}
					defaultAccountId={defaultAccountId}
					isSettingDefault={isSettingDefault}
					onDisconnect={handleDisconnectAccount}
					onSetDefault={handleSetDefaultAccount}
					onUpdateAccount={handleUpdateAccount}
					isAddAccountDialogOpen={isAddAccountDialogOpen}
					onAddAccountDialogOpenChange={setIsAddAccountDialogOpen}
				/>

				<SecuritySection />
			</div>
		</div>
	);
}
