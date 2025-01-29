import EventEmitter from 'events';
import type { Ver, Op } from './constants.ts';
type PacketStruct = {
    packetLen?: number;
    headerLen?: number;
    ver: Ver;
    seq?: number;
};
type DataPack = (PacketStruct & {
    op: 2;
    body: never;
}) | (PacketStruct & {
    op: 3;
    body: number;
}) | (PacketStruct & {
    op: 5;
    body: string;
}) | (PacketStruct & {
    op: 7;
    body: never;
}) | (PacketStruct & {
    op: 8;
    body: string;
});
declare class SubClient extends EventEmitter {
    protected textDecoder: TextDecoder;
    protected textEncoder: TextEncoder;
    protected convertToObject(data: ArrayBuffer): DataPack;
    protected convertToArrayBuffer(token: string | undefined, op: Op): ArrayBuffer;
    private mergeArrayBuffer;
}
export default SubClient;
