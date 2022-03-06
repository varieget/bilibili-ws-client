# bilibili-ws-client

适用于 Bilibili 直播的 `Websocket` 客户端。

可用于实时获取弹幕 `DANMU_MSG`、收到礼物 `SEND_GIFT`、开播 `LIVE`、下播 `PREPARING` 等信息。

## Getting Started

`bilibili-ws-client` 支持以 `cjs` 和 `esm` 的方式使用。

```bash
npm install bilibili-ws-client
```

### 在 node.js 使用

```js
const Client = require('bilibili-ws-client');

const sub = new Client({ roomId: 1 });

sub.on('open', () => {
  // ...
  console.log('authorized');
});

sub.on('close', () => {
  // ...
});

sub.on('message', ({ ver, op, cmd, body, ts }) => {
  if (op === 3) {
    console.log('online: ' + body);
  } else if (op === 5) {
    switch (cmd) {
      case 'LIVE':
        // 开播
        // ...
        break;
      case 'PREPARING':
        // 闲置（下播）
        // ...
        break;
      case 'DANMU_MSG':
        console.log(body);
        break;
      default:
        break;
    }
  } else {
    // ...
    console.log('op: ' + op);
    console.log('body: ' + body);
  }
});

sub.on('error', (err) => {
  throw new Error(err);
});
```

### 在前端项目使用

```js
import Client from 'bilibili-ws-client';

const sub = new Client({ roomId: 1 });
// ...
```

### 在浏览器使用

## 开发

```bash
npm run prettier
npm run build
```
