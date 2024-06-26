import msgpack from "./msgpack.js";

const socket = {
  socket: null,
  connected: false,
  socketId: -1,
  
  connect(address, callback, events) {
    if (this.socket) return;
    
    this.socket = new WebSocket(address);
    this.socket.binaryType = 'arraybuffer';
    
    this.socket.onmessage = message => {
      let msg = new Uint8Array(message.data),
        parsed = msgpack.decode(msg);
      let [type, data] = parsed;
          
      if (type == "io-init") this.socketId = data[0];
      else if (events[type]) events[type].apply(void 0, data);
    };
    
    this.socket.onopen = () => {
      this.connected = true;
      try {
        callback();
      } catch(e) { console.warn(e) };
    };
    
    this.socket.onclose = event => {
      this.connected = false;
      try {
        callback('Socket closed');
      } catch(e) { console.warn(e) };
    };
  },
  send(type) {
    const data = Array.prototype.slice.call(arguments, 1),
      binary = msgpack.encode([
        type,
        data
      ]);
    this.socket.send(binary);
  },
  socketReady() {
    return this.socket && this.connected;
  },
  close() {
    this.socket.close();
  }
}

export default socket;
