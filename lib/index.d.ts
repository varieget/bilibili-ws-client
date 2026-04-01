import type { Token, LoggerOption, Ver, Op } from './constants.ts';
import SubClient from './subClient.ts';
interface Client {
    on(event: 'close', listener: (this: Client) => void): this;
    on(event: 'error', listener: (this: Client, err: Error) => void): this;
    on(event: 'message', listener: (this: Client, body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
    }) => void): this;
    on(event: 'open', listener: (this: Client, body: string) => void): this;
    once(event: 'close', listener: (this: Client) => void): this;
    once(event: 'error', listener: (this: Client, err: Error) => void): this;
    once(event: 'message', listener: (this: Client, body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
    }) => void): this;
    once(event: 'open', listener: (this: Client, body: string) => void): this;
    off(event: 'close', listener: (this: Client) => void): this;
    off(event: 'error', listener: (this: Client, err: Error) => void): this;
    off(event: 'message', listener: (this: Client, body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
    }) => void): this;
    off(event: 'open', listener: (this: Client, body: string) => void): this;
    addListener(event: 'close', listener: (this: Client) => void): this;
    addListener(event: 'error', listener: (this: Client, err: Error) => void): this;
    addListener(event: 'message', listener: (this: Client, body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
    }) => void): this;
    addListener(event: 'open', listener: (this: Client, body: string) => void): this;
    removeListener(event: 'close', listener: (this: Client) => void): this;
    removeListener(event: 'error', listener: (this: Client, err: Error) => void): this;
    removeListener(event: 'message', listener: (this: Client, body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
    }) => void): this;
    removeListener(event: 'open', listener: (this: Client, body: string) => void): this;
}
declare class Client extends SubClient {
    private options;
    private ws?;
    private log;
    private MAX_CONNECT_TIMES;
    private DELAY;
    /**
     * 直播客户端
     * @constructor
     * @param {Token} token - 房间号或令牌
     */
    constructor(token: Token);
    /**
     * 直播客户端
     * @constructor
     * @param {Token} token - 房间号或令牌
     */
    constructor(token: Token);
    /**
     * 直播客户端
     * @constructor
     * @param {Token} token - 房间号或令牌
     * @param {LoggerOption} logger - 记录日志
     */
    constructor(token: Token, logger?: LoggerOption);
    /**
     * 直播客户端
     * @constructor
     * @param {Token} token - 房间号或令牌
     * @param {LoggerOption} logger - 记录日志
     * @param {number} maxConnectTimes - 最多重试次数，达到上限后重置，默认为 6
     */
    constructor(token: Token, logger?: LoggerOption, maxConnectTimes?: number);
    /**
     * 直播客户端
     * @constructor
     * @param {Token} token - 房间号或令牌
     * @param {LoggerOption} logger - 记录日志
     * @param {number} maxConnectTimes - 最多重试次数，达到上限后重置，默认为 6
     * @param {number} delay - 重试间隔，默认为 3000
     */
    constructor(token: Token, logger?: LoggerOption, maxConnectTimes?: number, delay?: number);
    private connect;
    private messageReceived;
    /**
     * 断开直播客户端
     */
    close(): void;
}
export default Client;
