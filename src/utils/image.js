import cloudinary from "cloudinary";
import { envVariable } from "../configs";
import fs from "fs";

const { CLOUD_NAME, API_KEY_CLOUD, API_SECRET_CLOUD } = envVariable;

class ImageUtils {
  constructor() {
    this.cloudinary = cloudinary.v2;

    this.cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY_CLOUD,
      api_secret: API_SECRET_CLOUD,
      secure: true,
    });
  }

  uploadImageAdmin(file) {
    return new Promise((resolve, reject) => {
      const uploader = this.cloudinary.uploader.upload(file, {
        folder: "DoAnTN",
      }).then((result) => {
        if (result) {
          fs.unlinkSync(file);
          resolve({
            url: result.secure_url,
          });
        }
      }).catch((err) => {
        fs.unlinkSync(file);
        reject(err);
      });
    });
  }


  removeImageToCloud(url) {
    global.logger.info("ImageUtils::removeImageToCloud" + url);
    const id = url.split('/').slice(-1)[0].split('.')[0];
    cloudinary.v2.uploader.destroy(id, (result) => {
      return true;
    });
  }

  async getSignature() {
    // grab a current UNIX timestamp
    let timestamp = Math.round(new Date().getTime() / 1000);
    let signature = await cloudinary.v2.utils.api_sign_request({ timestamp }, envVariable.API_SECRET_CLOUD);
    return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload?api_key=${API_KEY_CLOUD}&signature=${signature}&timestamp=${timestamp}`;
  }
}

export default new ImageUtils();