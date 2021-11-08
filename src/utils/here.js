import axios from "axios";
import { envVariable } from "../configs";
const { HERE_API_KEY } = envVariable;
class HereUtils {
  constructor() {
    this.geocoder = axios.create({
      baseURL: "https://geocode.search.hereapi.com/v1/",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      }
    });
  }

  // convert string UTF-8 to encoded URL parameter

  convertToURLParameter(address) {
    return encodeURIComponent(address).replace(/%20/g, "+");
  }


  async getGeoLocation(address) {
    console.log(this.convertToURLParameter(address));
    let res = await this.geocoder.get(`geocode?apiKey=${HERE_API_KEY}&q=${this.convertToURLParameter(address)}`);

    if (res.data.items.length > 0) {
      return res.data.items.slice(-1)[0].position;
    } else {
      return null;
    }
  }
}

export default new HereUtils();