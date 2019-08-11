function getDefaultUrl() { 
  return 'ws://192.168.0.106:81/';
}

class WsClient {
  constructor(url = getDefaultUrl()) {
    this.url = url;
    this.connection = null;
  }
  connect() {
    return new Promise((resolve, reject) => {
        const connection = new WebSocket(this.url, ['arduino']);

        connection.onopen = () => {
          connection.send('Connect ' + new Date());
          resolve(this);
        };

        connection.onerror = error => {
          console.log('WebSocket Error ', error);
          reject(error);
        };

        connection.onmessage = function(e) {
          console.log('Server: ', e.data);
        };

        this.connection = connection;
    });
  }

  sendRGB(r, g, b) {
    if (this.connection.bufferedAmount > 0) {
      console.warn('Ignoring sendRGB data due to non-empty send buffer');
      return;
    }
    const twoHex = value => parseInt(value).toString(16).padStart(2, '0');
    const msg = `#${twoHex(r)}${twoHex(g)}${twoHex(b)}`;
    this.connection.send(msg);
  }
}

function connectWs() {
  const client = new WsClient(getDefaultUrl());
  window.webSocketClient = client;
  return client.connect();
}

console.log('Loaded webSocketClient');