import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5090/api';
const apiOrigin = apiBase.replace(/\/api\/?$/, '');

let activeBoardConnectionId = null;

export const setBoardConnectionId = (id) => {
    activeBoardConnectionId = id || null;
};

export const getBoardConnectionId = () => activeBoardConnectionId;

export const createHubConnection = (path) =>
    new HubConnectionBuilder()
        .withUrl(`${apiOrigin}${path}`, { withCredentials: true })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();
