import Promise from 'bluebird';
import { envVariable } from '../configs'
class RedisUtils {
  /**
   * Delete sessions by ids
   *
   * @param {*} ids
   * @returns
   * @memberof RedisHelper
   */
  delSessionsByIds(ids, excludeId = null) {
    if (!ids) return Promise.resolve(true);

    ids = typeof ids == 'object' ? ids : JSON.parse(ids);

    if (excludeId) {
      const sessionIndex = ids.indexOf(excludeId);
      if (sessionIndex > -1) {
        ids.splice(sessionIndex, 1);
      }
    }

    return Promise.map(ids, id => this.delSessionById(id));
  }

  /**
   * Delete session by session id
   *
   * @param {*} id
   * @returns Promise
   * @memberof RedisHelper
   */
  delSessionById(id) {
    return this.del(`sess:${id}`);
  }

  /**
   * Get session by session id
   *
   * @param {*} id
   * @returns Promise
   * @memberof RedisHelper
   */
  getSessionById(id) {
    return this.get(`sess:${id}`);
  }

  /**
   * Check session exists or not
   *
   * @param {*} id
   * @returns
   * @memberof RedisHelper
   */
  sessionExists(id) {
    return this.exists(`sess:${id}`);
  }

  /**
   * Check key exists or not
   *
   * @param {*} key
   * @returns
   * @memberof RedisHelper
   */
  exists(key) {
    return new Promise((resolve, reject) => {
      global.redisClient.exists(key, (err, result) => {
        if (err) {
          reject(err);
        }

        if (result) {
          resolve(true);
        }

        resolve(false);
      });
    });
  }

  /**
   * Delete a key
   *
   * @param {*} key
   * @returns
   * @memberof RedisHelper
   */
  del(key) {
    return new Promise((resolve, reject) => {
      global.redisClient.del(key, (err, result) => {
        if (err) {
          reject(err);
        }

        if (result) {
          resolve(true);
        }

        resolve(false);
      });
    });
  }

  /**
   * Get a key
   *
   * @param {*} key
   * @returns
   * @memberof RedisHelper
   */
  get(key) {
    return new Promise((resolve, reject) => {
      global.redisClient.get(key, (err, result) => {
        if (err) {
          reject(err);
        }

        if (result) {
          try {
            result = JSON.parse(result);
            resolve(result);
          } catch (error) {
            resolve(result);
          }
        }

        reject(err);
      });
    });
  }

  /**
   * Set new key
   *
   * @param {*} key
   * @param {*} value
   * @returns
   * @memberof RedisHelper
   */
  set(key, value) {
    return new Promise((resolve, reject) => {
      global.redisClient.set(key, value, envVariable.expireTime, (err, result) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

export default new RedisUtils();
