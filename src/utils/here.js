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
        Accept: "application/json"
      }
    });
  }

  // convert string UTF-8 to encoded URL parameter

  convertToURLParameter(address) {
    return encodeURIComponent(address).replace(/%20/g, "+");
  }


  async getGeoLocation(address) {
    console.log(this.convertToURLParameter(address));
    let res = await this.geocoder.get("geocode", {
      params: {
        apiKey: HERE_API_KEY,
        q: this.convertToURLParameter(address),
      }
    });
    return res.data.items[0].position;
  }
}

export default new HereUtils();