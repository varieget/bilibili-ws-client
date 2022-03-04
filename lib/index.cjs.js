'use strict';

var util = require('util');
var WebSocket = require('ws');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var packetOffset = 0; // 数据包

var headerOffset = 4; // 数据包头部

var rawHeaderLen = 16; // 数据包头部长度（固定为 16）

var verOffset = 6; // 协议版本

var opOffset = 8; // 操作类型

var seqOffset = 12; // 数据包头部

var Client = /*#__PURE__*/function () {
  function Client(options) {
    _classCallCheck(this, Client);

    var MAX_CONNECT_TIMES = 10; // 最多重试次数

    var DELAY = 15000; // 重试间隔

    this.options = Object.assign({
      roomId: 1,
      log: console.log
    }, options);
    this.textDecoder = new util.TextDecoder('utf-8');
    this.textEncoder = new util.TextEncoder();
    this.connect(MAX_CONNECT_TIMES, DELAY);
  }

  _createClass(Client, [{
    key: "connect",
    value: function connect(max, delay) {
      var _this = this;

      if (max === 0) return;
      var ws = new WebSocket__default["default"]('wss://broadcastlv.chat.bilibili.com:2245/sub');
      ws.binaryType = 'arraybuffer';
      var _this$options = this.options,
          roomId = _this$options.roomId,
          log = _this$options.log;
      ws.on('open', function () {
        log('auth start');
        var token = JSON.stringify({
          roomid: roomId,
          protover: 2,
          platform: 'web'
        });
        ws.send(_this.convertToArrayBuffer(token, 7));
      });
      var heartbeatInterval;
      ws.on('message', function (data) {
        var dataView = new DataView(data, 0);
        var ts = Math.floor(Date.now() / 1000);

        var _this$convertToObject = _this.convertToObject(data),
            body = _this$convertToObject.body,
            packetLen = _this$convertToObject.packetLen,
            headerLen = _this$convertToObject.headerLen,
            ver = _this$convertToObject.ver,
            op = _this$convertToObject.op,
            seq = _this$convertToObject.seq;

        if (op !== 3 && op !== 5) {
          log('receiveHeader:', {
            packetLen: packetLen,
            headerLen: headerLen,
            ver: ver,
            op: op,
            seq: seq,
            body: body
          });
        }

        switch (op) {
          case 8:
            // 进房
            // send heartbeat
            heartbeatInterval = setInterval(function () {
              ws.send(_this.convertToArrayBuffer('', 2));
              log('send: heartbeat;');
            }, 30 * 1000);
            break;

          case 3:
            // 人气
            // heartbeat reply
            log('receive: heartbeat;', {
              online: body
            }); // callback

            _this.messageReceived(ver, op, body, ts);

            break;

          case 5:
            // batch message
            for (var offset = 0, _packetLen, _body; offset < data.byteLength; offset += _packetLen) {
              // parse
              _packetLen = dataView.getInt32(offset);

              var _headerLen = dataView.getInt16(offset + headerOffset);

              var _ver = dataView.getInt16(offset + verOffset); // callback


              try {
                if (_ver === 2) {
                  // 2020.04.10 开始全面压缩
                  var _msgBody = data.slice(offset + _headerLen, offset + _packetLen);

                  var bufBody = zlib__default["default"].inflateSync(new Uint8Array(_msgBody));
                  _body = _this.convertToObject(bufBody.buffer).body;
                } else {
                  _body = _this.textDecoder.decode(data.slice(offset + _headerLen, offset + _packetLen));
                }

                _this.messageReceived(_ver, op, JSON.parse(_body), ts);

                log('messageReceived:', {
                  ver: _ver,
                  body: _body
                });
              } catch (e) {
                console.error('decode body error:', e);
              }
            }

            break;
        }
      });
      ws.on('close', function () {
        log('closed');

        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }

        setTimeout(reConnect, delay);
      });
      ws.on('error', function (e) {
        console.error(e);
      });

      var reConnect = function reConnect() {
        return _this.connect(--max, delay * 2);
      };
    }
  }, {
    key: "messageReceived",
    value: function messageReceived(ver, op, body, ts) {
      var _this$options$notify, _this$options2;

      var _ref = body,
          cmd = _ref.cmd;
      (_this$options$notify = (_this$options2 = this.options).notify) === null || _this$options$notify === void 0 ? void 0 : _this$options$notify.call(_this$options2, _objectSpread2(_objectSpread2({
        ver: ver,
        op: op
      }, cmd ? {
        cmd: cmd
      } : {}), {}, {
        body: body,
        ts: ts
      }));
    }
  }, {
    key: "convertToObject",
    value: function convertToObject(data) {
      // decode
      var dataView = new DataView(data, 0);
      var packetLen = dataView.getInt32(packetOffset);
      var headerLen = dataView.getInt16(headerOffset);
      var ver = dataView.getInt16(verOffset);
      var op = dataView.getInt32(opOffset);
      var seq = dataView.getInt32(seqOffset);
      var msgBody = this.textDecoder.decode(data.slice(headerLen, packetLen));
      var result = {
        packetLen: packetLen,
        headerLen: headerLen,
        ver: ver,
        op: op,
        seq: seq
      };

      if (op === 3) {
        result.body = dataView.getInt32(rawHeaderLen);
      } else {
        result.body = msgBody;
      }

      return result;
    }
  }, {
    key: "convertToArrayBuffer",
    value: function convertToArrayBuffer() {
      var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var op = arguments.length > 1 ? arguments[1] : undefined;
      // encode
      var headerBuf = new ArrayBuffer(rawHeaderLen);
      var headerView = new DataView(headerBuf, 0);
      var bodyBuf = this.textEncoder.encode(token);
      headerView.setInt32(packetOffset, rawHeaderLen + bodyBuf.byteLength); // 数据包长度

      headerView.setInt16(headerOffset, rawHeaderLen);
      headerView.setInt16(verOffset, 1); // 协议版本 为1

      headerView.setInt32(opOffset, op); // op 操作码

      headerView.setInt32(seqOffset, 1); // 数据包头部长度（固定为 1）

      return this.mergeArrayBuffer(headerBuf, bodyBuf);
    }
  }, {
    key: "mergeArrayBuffer",
    value: function mergeArrayBuffer(ab1, ab2) {
      var u81 = new Uint8Array(ab1),
          u82 = new Uint8Array(ab2),
          res = new Uint8Array(ab1.byteLength + ab2.byteLength);
      res.set(u81, 0);
      res.set(u82, ab1.byteLength);
      return res.buffer;
    }
  }]);

  return Client;
}();

module.exports = Client;
