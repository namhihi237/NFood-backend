import { jwtUtils, HttpError } from "../utils";

class AuthenticationMiddleware {
  async jwtMiddleware(req, res, next) {
    try {
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        throw new HttpError('No token, authorization denied', 401);
      }
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await jwtUtils.verify(token);

        req.user = decodedToken.data;
        global.logger.info('AuthenticationMiddleware::jwtMiddleware:::' + JSON.stringify(req.user));
        next();
      } catch (e) {
        throw new HttpError('Token is invalid', 400);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default AuthenticationMiddleware;