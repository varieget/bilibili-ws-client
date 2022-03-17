/// <reference types="node" />
import EventEmitter from 'events';
import { TextEncoder, TextDecoder } from 'util';
import type { Options, SubClient } from './subClient';
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
