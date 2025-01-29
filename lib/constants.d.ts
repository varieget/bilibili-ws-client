export declare const packetOffset = 0;
export declare const headerOffset = 4;
export declare const rawHeaderLen = 16;
export declare const verOffset = 6;
export declare const opOffset = 8;
export declare const seqOffset = 12;
export type Ver = 1 | 2 | 3;
export type Op = 2 | 3 | 5 | 7 | 8;
export type Token = number | Partial<{
    uid: number;
    roomid: number;
    protover: Ver;
    buvid: string;
    platform: string;
    clientver: string;
    type: number;
    key: string;
}>;
