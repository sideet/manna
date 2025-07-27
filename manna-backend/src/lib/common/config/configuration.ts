import qs from 'qs';

export const configuration = () => {
  const redis = qs.parse(process.env.REDIS);

  return {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    redis: {
      host: redis.host,
      port: redis.port,
    },
    jwt: {
      jwtAccessKey: process.env.JWT_ACCESS_SECRET_KEY,
      jwtRefreshKey: process.env.JWT_REFRESH_SECRET_KEY,
      algorithm: process.env.JWT_ALGORITHM,
      issuer: process.env.JWT_ISSUER,
    },
    encrypt: {
      saltOrRounds: process.env.SALT_ROUNDS,
      secret: process.env.ENCRYPT_SECRET_KEY,
    },
    webhook: {
      serverError: process.env.SERVER_ERROR_WEBHOOK,
    },
  };
};
