import type { Provider } from "./providers/interface/provider";
import type { Auth, SessionUser } from "@nimbus/auth/auth";
import { getContext } from "hono/context-storage";
import type { RedisClient } from "@nimbus/cache";
import { Hono, type Env as HonoEnv } from "hono";
import type { Env } from "@nimbus/env/server";
import type { DB } from "@nimbus/db";

export interface BaseRouterVars {
	env: Env;
}

export interface PublicRouterVars extends BaseRouterVars {
	db: DB;
	redisClient: RedisClient;
	auth: Auth;
}

export interface ProtectedRouterVars extends PublicRouterVars {
	user: SessionUser;
}

export interface DriveProviderRouterVars extends ProtectedRouterVars {
	provider: Provider;
}

export interface PublicRouterEnv {
	Variables: PublicRouterVars;
}

export interface ProtectedRouterEnv {
	Variables: ProtectedRouterVars;
}

export interface DriveProviderRouterEnv {
	Variables: DriveProviderRouterVars;
}

function createHono<T extends HonoEnv>() {
	return new Hono<T>();
}

export function createPublicRouter() {
	return createHono<PublicRouterEnv>();
}

export function createProtectedRouter() {
	return createHono<ProtectedRouterEnv>();
}

export function createDriveProviderRouter() {
	return createHono<DriveProviderRouterEnv>();
}

export function getDriveProviderContext() {
	return getContext<DriveProviderRouterEnv>();
}
