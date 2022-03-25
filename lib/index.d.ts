import type { Ver, Op } from './constants';
import SubClient from './subClient';
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
    /**
     * 直播客户端
     * @constructor
     * @param {number} roomId - 房间号
     */
    constructor(roomId: number);
    /**
     * 直播客户端
     * @constructor
     * @param {number} roomId - 房间号
     * @param {boolean} enableLog - 记录日志，通过 console.log
     */
    constructor(roomId: number, enableLog?: boolean);
    /**
     * 直播客户端
     * @constructor
     * @param {number} roomId - 房间号
     * @param {boolean} enableLog - 记录日志，通过 console.log
     * @param {number} maxConnectTimes - 最多重试次数，默认为 10
     */
    constructor(roomId: number, enableLog?: boolean, maxConnectTimes?: number);
    /**
     * 直播客户端
     * @constructor
     * @param {number} roomId - 房间号
     * @param {boolean} enableLog - 记录日志，通过 console.log
     * @param {number} maxConnectTimes - 最多重试次数，默认为 10
     * @param {number} delay - 重试间隔，默认为 15000
     */
    constructor(roomId: number, enableLog?: boolean, maxConnectTimes?: number, delay?: number);
    private connect;
    private messageReceived;
}
export default Client;
