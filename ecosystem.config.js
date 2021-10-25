module.exports = {
  apps: [{
    name: 'food',
    append_env_to_name: true,
    script: 'index.js',
    instances: 4,
    autorestart: true,
    max_memory_restart: '1G',
    env: { // common env variable
      NODE_ENV: 'development'
    },
    env_production: { // khi deploy với option --env production
      NODE_ENV: "production",
      PORT: 8000
    },
  }],

  deploy: {
    production: {
      user: 'poppy237', // user để ssh
      host: '20.37.38.82', // IP của server này (theo sơ đồ)
      ref: 'origin/main', // branch để pull source
      repo: 'git@github.com:namhihi237/Food-delivery-backend.git', // repo của project
      path: '/home/poppy237/food', // sẽ deploy vào thư mục này
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production' // cmd để deploy
    },
  }
};