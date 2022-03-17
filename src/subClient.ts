import type { TextEncoder, TextDecoder } from 'util';

export type Ver = 1 | 2;
export type Op = 2 | 3 | 5 | 7 | 8;

type PacketStruct = {
  packetLen?: number;
  headerLen?: number;
  ver: Ver;
  seq?: number;
};

export type DataPack =
  | (PacketStruct & { op: 2; body: never }) // send heartbeat
  | (PacketStruct & { op: 3; body: number }) // heartbeat reply
  | (PacketStruct & { op: 5; body: string }) // batch message
  | (PacketStruct & { op: 7; body: never }) // auth start
  | (PacketStruct & { op: 8; body: string }); // authorized

export type Options = {
  roomId: number;
  enableLog?: boolean;
  maxConnectTimes?: number;
  delay?: number;
};

export interface SubClient {
  options: Options;
  textDecoder: TextDecoder;
  textEncoder: TextEncoder;
}
