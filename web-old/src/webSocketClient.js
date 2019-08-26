const twoHex = value => parseInt(value).toString(16).padStart(2, '0');

export class WsClient {
  constructor(url, namespaces = ['arduino']) {
    if (!url) {
      throw new Error('Url required');
    }
    this.url = url;
    this.connection = null;
    if (namespaces) this.namespaces = namespaces;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const connection = new WebSocket(this.url);

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
      } catch (err) {
        reject(err);
      }
    });
  }

  send(data, allowNonEmptyBuffer = false) {
    if (this.connection.bufferedAmount > 0 && !allowNonEmptyBuffer) {
      console.warn('Ignoring send due to non-empty send buffer', data);
      return;
    }
    console.log('Sending: ', data);
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