const twoHex = value => parseInt(value).toString(16).padStart(2, '0');

export class WsClient {
  constructor(url) {
    if (!url) {
      throw new Error('Url required');
    }
    this.url = url;
    this.connection = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
        const connection = new WebSocket(this.url, ['arduino']);
0
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

  send(data, allowNonEmptyBuffer = false) {
    if (this.connection.bufferedAmount > 0 && !allowNonEmptyBuffer) {
      console.warn('Ignoring send due to non-empty send buffer', data);
      return;
    }
    this.connection.send(data);
  }

  sendRgb([r, g, b]) {
    const msg = `#${twoHex(r)}${twoHex(g)}${twoHex(b)}`;
    this.connection.send(msg);
  }
}

export function connectWs() {
  const client = new WsClient(getDefaultUrl());
  window.webSocketClient = client;
  return client.connect();
}

console.log('Loaded webSocketClient');