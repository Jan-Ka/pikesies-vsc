// TODO: put into shared project

// @ts-ignore 6059
import { name as serverName } from '../package.json';

export const SERVER_NAME = serverName;

export const SERVER_COMMANDS = {
    validate: `${SERVER_NAME}.validate`
} as const;

export const SERVER_METHODS = {
    noProblemsFound: `${SERVER_NAME}.noProblemsFound`
} as const;