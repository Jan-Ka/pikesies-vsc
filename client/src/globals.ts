// TODO: put into shared project

// @ts-ignore 6059
import { name as serverName } from '../../server/package.json';
// @ts-ignore 6059
import { name as clientName } from '../package.json';
// @ts-ignore 6059
import { name as appName } from '../../package.json';

export const SERVER_NAME = serverName;

export const CLIENT_NAME = clientName;

export const APP_NAME = appName;

export const APP_COMMANDS = {
    validate: `${APP_NAME}.validate`
} as const;

export const SERVER_COMMANDS = {
    validate: `${SERVER_NAME}.validate`
} as const;

export const SERVER_METHODS = {
    noProblemsFound: `${SERVER_NAME}.noProblemsFound`
} as const;