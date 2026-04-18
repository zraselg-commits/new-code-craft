// PM2 Ecosystem Config — Code Craft BD
// Renamed to .cjs because package.json has "type": "module"
// Usage on VPS: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "codecraftbd",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3100,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3100,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
