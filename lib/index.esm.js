import WebSocket from 'isomorphic-ws';
import zlib from 'zlib';
import { Buffer } from 'buffer';
import EventEmitter from 'events';

function _assertThisInitialized(e) {
  if (undefined === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function () {
    return !!t;
  })();
}
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == typeof e || "function" == typeof e)) return e;
  if (undefined !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (undefined !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var packetOffset = 0; // 数据包
var headerOffset = 4; // 数据包头部
var rawHeaderLen = 16; // 数据包头部长度（固定为 16）
var verOffset = 6; // 协议版本
var opOffset = 8; // 操作类型
var seqOffset = 12; // 数据包头部

// authorized
var SubClient = /*#__PURE__*/function (_EventEmitter) {
  function SubClient() {
    var _this;
    _classCallCheck(this, SubClient);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, SubClient, [].concat(args));
    _defineProperty(_this, "textDecoder", new TextDecoder('utf-8'));
    _defineProperty(_this, "textEncoder", new TextEncoder());
    return _this;
  }
  _inherits(SubClient, _EventEmitter);
  return _createClass(SubClient, [{
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
}(EventEmitter);

var Client = /*#__PURE__*/function (_SubClient) {
  function Client(token, enableLog, maxConnectTimes, delay) {
    var _this;
    _classCallCheck(this, Client);
    _this = _callSuper(this, Client);
    if (!token) {
      throw new Error('miss token.');
    }
    var MAX_CONNECT_TIMES = maxConnectTimes !== null && maxConnectTimes !== undefined ? maxConnectTimes : 10; // 最多重试次数
    var DELAY = delay !== null && delay !== undefined ? delay : 15000; // 重试间隔

    _this.options = {
      token: token,
      enableLog: enableLog
    };
    _this.connect(MAX_CONNECT_TIMES, DELAY);
    return _this;
  }
  _inherits(Client, _SubClient);
  return _createClass(Client, [{
    key: "connect",
    value: function connect(max, delay) {
      var _this2 = this;
      if (max === 0) throw new Error('maxConnectTimes should not equal 0.');
      this.ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
      this.ws.binaryType = 'arraybuffer';
      var _this$options = this.options,
        roomId = _this$options.token,
        enableLog = _this$options.enableLog;
      this.ws.onopen = function () {
        var _this2$ws;
        if (enableLog) console.log('auth start');
        var token = JSON.stringify(typeof roomId === 'number' ? {
          roomid: roomId,
          protover: 2,
          platform: 'web'
        } : roomId // token
        );
        (_this2$ws = _this2.ws) === null || _this2$ws === undefined || _this2$ws.send(_this2.convertToArrayBuffer(token, 7));
      };
      var heartbeatInterval;
      this.ws.onmessage = function (event) {
        var _ref = event,
          data = _ref.data;
        var dataView = new DataView(data, 0);
        var ts = Math.floor(Date.now() / 1000);
        var _this2$convertToObjec = _this2.convertToObject(data),
          body = _this2$convertToObjec.body,
          packetLen = _this2$convertToObjec.packetLen,
          headerLen = _this2$convertToObjec.headerLen,
          ver = _this2$convertToObjec.ver,
          op = _this2$convertToObjec.op,
          seq = _this2$convertToObjec.seq;
        if (op !== 3 && op !== 5) {
          if (enableLog) console.log('receiveHeader:', {
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
            _this2.emit('open', body);

            // send heartbeat
            heartbeatInterval = setInterval(function () {
              var _this2$ws2;
              (_this2$ws2 = _this2.ws) === null || _this2$ws2 === undefined || _this2$ws2.send(_this2.convertToArrayBuffer('', 2));
              if (enableLog) console.log('send: heartbeat;');
            }, 30 * 1000);
            break;
          case 3:
            // 人气
            // heartbeat reply
            if (enableLog) console.log('receive: heartbeat;', {
              online: body
            });
            _this2.messageReceived(ver, op, body, ts);
            break;
          case 5:
            // batch message
            for (var offset = 0, _packetLen, _body; offset < data.byteLength; offset += _packetLen) {
              // parse
              _packetLen = dataView.getInt32(offset);
              var _headerLen = dataView.getInt16(offset + headerOffset);
              var _ver = dataView.getInt16(offset + verOffset);
              try {
                if (_ver === 2) {
                  var msgBody = data.slice(offset + _headerLen, offset + _packetLen);
                  var bufBody = zlib.inflateSync(Buffer.from(msgBody));
                  _body = _this2.convertToObject(bufBody.buffer.slice(bufBody.byteOffset, bufBody.byteOffset + bufBody.byteLength)).body;
                } else if (_ver === 3) {
                  var _msgBody = data.slice(offset + _headerLen, offset + _packetLen);
                  var _bufBody = zlib.brotliDecompressSync(Buffer.from(_msgBody));
                  _body = _this2.convertToObject(_bufBody.buffer.slice(_bufBody.byteOffset, _bufBody.byteOffset + _bufBody.byteLength)).body;
                } else {
                  _body = _this2.textDecoder.decode(data.slice(offset + _headerLen, offset + _packetLen));
                }
                _this2.messageReceived(_ver, op, _body, ts);
                if (enableLog) console.log('messageReceived:', {
                  ver: _ver,
                  body: _body
                });
              } catch (e) {
                _this2.emit('error', e);
                if (enableLog) console.error('decode body error:', e);
              }
            }
            break;
        }
      };
      this.ws.onclose = function (_ref2) {
        var code = _ref2.code;
        if (enableLog) console.log('closed');
        _this2.emit('close');
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        if (code !== 1000) setTimeout(reConnect, delay);
      };
      this.ws.onerror = function (e) {
        _this2.emit('error', e);
      };
      var reConnect = function reConnect() {
        return _this2.connect(--max, delay * 2);
      };
    }
  }, {
    key: "messageReceived",
    value: function messageReceived(ver, op, body, ts) {
      var cmd;
      switch (op) {
        case 3:
          this.emit('message', {
            ver: ver,
            op: op,
            body: body,
            ts: ts
          });
          break;
        case 5:
          var _JSON$parse = JSON.parse(body);
          cmd = _JSON$parse.cmd;
          this.emit('message', {
            ver: ver,
            op: op,
            cmd: cmd,
            body: body,
            ts: ts
          });
          break;
      }
    }

    /**
     * 断开直播客户端
     */
  }, {
    key: "close",
    value: function close() {
      var _this$ws;
      (_this$ws = this.ws) === null || _this$ws === undefined || _this$ws.close(1000);
    }
  }]);
}(SubClient);

export { Client as default };
