# bilibili-ws-client

适用于 Bilibili 直播的 `Websocket` 客户端。

可用于实时获取弹幕 `DANMU_MSG`、收到礼物 `SEND_GIFT`、开播 `LIVE`、下播 `PREPARING` 等信息。

## 起步

`bilibili-ws-client` 支持以 `CommonJS` 或 `ESM` 的方式使用。

也支持从 HTML 文件和 script 标签开始。

### 在网页中添加 `bilibili-ws-client`

将 js 添加到 HTML 中，且无需安装，即可立即开始使用。

添加 script 标签，应该如下所示：

```html
<script src="https://unpkg.com/bilibili-ws-client/lib/index.umd.js"></script>
<script>
  const sub = new Client(1);

  sub.on('open', () => {
    // ...
    console.log('authorized');
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
    }
  });
</script>
```

### 通过以下方式安装 `bilibili-ws-client`

```bash
npm install bilibili-ws-client
```

或者

```bash
yarn add bilibili-ws-client
```

### 在 node.js 使用

作为 `CommonJS` 模块使用：

```js
const Client = require('bilibili-ws-client');

const sub = new Client(roomId);

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

作为 `ESM` 模块使用：

```js
import Client from 'bilibili-ws-client';

const sub = new Client(roomId);
// ...
```

## 配置

- **[`roomId`](#roomId)**
- **[`enableLog`](#enableLog)**
- **[`maxConnectTimes`](#maxConnectTimes)**
- **[`delay`](#delay)**

### `roomId`

Type:

```ts
type roomId = number;
```

需要连接的房间号。

### `enableLog`

Type:

```ts
type enableLog = boolean | undefined;
```

默认值：`false`

是否记录日志，将通过 `console.log` 输出。

### `maxConnectTimes`

Type:

```ts
type maxConnectTimes = number | undefined;
```

默认值：`10`

当 `WebSocket` 触发 `close` 时，最多重试再次连接的次数。

### `delay`

Type:

```ts
type delay = number | undefined;
```

默认值：`15000`

当 `WebSocket` 触发 `close` 时，间隔特定毫秒后重试。

## 开发

```bash
npm run prettier
npm run build
```
