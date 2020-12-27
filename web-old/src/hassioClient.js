const twoHex = (value) => parseInt(value).toString(16).padStart(2, "0");

export class HassioClient {
  url = "";
  _token = "";
  _tokenPromise = undefined;
  _currentSendPromise = undefined;

  constructor({ url, apiToken }) {
    if (!url || !apiToken) {
      throw new Error("Missing url or apiToken");
    }
    this.url = url;
    this._token = apiToken;
  }

  connect() {
    return Promise.resolve();
  }

  send(data) {
    console.error("HassioClient cant send random data");
  }

  async sendRgb(rgb) {
    if (!!this._currentSendPromise) {
      // busy
      return;
    }
    let timeout;
    this._currentSendPromise = new Promise((res) => {
      timeout = setTimeout(() => {
        this._currentSendPromise = undefined;
        res();
      }, 150);
    });

    const url = new URL("/api/services/light/turn_on", this.url).toString();
    const headers = {
      Authorization: `Bearer ${this._token}`,
      "content-type": "application/json",
    };
    const body = {
      entity_id: "light.desk_left",
      rgb_color: rgb,
      transition: 0,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      //mode: "no-cors",
      //credentials: "include",
      body: JSON.stringify(body), // body data type must match "Content-Type" header
    });

    if (response.ok) {
      // yay
      console.log("Sent to Hassio", rgb);
      //this._currentSendPromise = undefined;
      //if (timer) clearTimeout(timer);
    } else {
      console.warn(
        "POST to HassIo failed",
        response.status,
        response.statusText
      );
    }
  }
}

const fetchHassIoToken = () =>
  fetch("/secrets.json", { headers: { Accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : undefined))
    .then(({ hassio }) => {
      if (hassio) {
        console.log("Got hassio config", hassio);
        return hassio;
      } else {
        console.warn("config error");
        debugger;
        throw new Error("config error");
      }
    });

export const createHassIoClient = async () => {
  const config = await fetchHassIoToken();
  return new HassioClient(config);
};
