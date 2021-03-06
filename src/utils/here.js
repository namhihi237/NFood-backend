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

  //  get lat lng from address
  async getGeoLocation(address) {
    let res = await this.geocoder.get(`geocode?apiKey=${HERE_API_KEY}&q=${this.convertToURLParameter(address)}`);

    if (res.data.items.length > 0) {
      return res.data.items.slice(-1)[0].position;
    } else {
      return null;
    }
  }

  // get address from lat lng
  async getAddressFromLatLng(lat, lng) {
    let res = await this.geocoder.get(`revgeocode?apiKey=${HERE_API_KEY}&at=${lat},${lng}&lang=vi`);
    if (res.data.items.length > 0) {
      return res.data.items.slice(-1)[0].address.label;
    } else {
      return null;
    }
  }
}

export default new HereUtils();