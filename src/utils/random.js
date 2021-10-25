import constants from '../configs/constants';

class RandomUtils {
  randomCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += constants.ALPHABET[Math.floor(Math.random() * constants.ALPHABET.length)];
    }
    return code;
  }

  randomNumber(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += constants.NUMBERS[Math.floor(Math.random() * constants.NUMBERS.length)];
    }
    return code;
  }
}

export default new RandomUtils();