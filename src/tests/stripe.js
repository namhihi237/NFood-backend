import { stripeUtils } from "../utils";

stripeUtils.createTokenForTesting().then(function (token) {
  console.log(token);
}).catch(function (err) {
  console.log(err);
});