/// <reference types="node" />
import EventEmitter from 'events';
import { TextEncoder, TextDecoder } from 'util';
import type { Ver, Op, Options, SubClient } from './subClient';
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
declare class Client extends EventEmitter implements SubClient {
    options: Options;
    textDecoder: TextDecoder;
    textEncoder: TextEncoder;
    constructor(roomId: number);
    constructor(roomId: number, enableLog?: boolean);
    constructor(roomId: number, enableLog?: boolean, maxConnectTimes?: number);
    private connect;
    private messageReceived;
    private convertToObject;
    private convertToArrayBuffer;
    private mergeArrayBuffer;
}
export default Client;
