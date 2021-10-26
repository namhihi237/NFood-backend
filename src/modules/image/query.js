import { imageUtils, jwtUtils } from '../../utils';

const imageQuery = {
  getSignatureImage: async (parent, args, context, info) => {
    global.logger.info('imageQuery::getSignatureImage');

    const linkSignature = await imageUtils.getSignature();
    global.logger.info(`GET API signature ${JSON.stringify(linkSignature)}`);

    return linkSignature;

  }
}

export default imageQuery;