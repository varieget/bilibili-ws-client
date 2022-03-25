export const packetOffset = 0; // 数据包
export const headerOffset = 4; // 数据包头部
export const rawHeaderLen = 16; // 数据包头部长度（固定为 16）
export const verOffset = 6; // 协议版本
export const opOffset = 8; // 操作类型
export const seqOffset = 12; // 数据包头部

export type Ver = 1 | 2;
export type Op = 2 | 3 | 5 | 7 | 8;
