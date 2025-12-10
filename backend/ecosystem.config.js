/**
 * PM2 Ecosystem Configuration - Enterprise Production
 * Chạy Node.js ở Cluster mode, tận dụng tối đa CPU
 */
module.exports = {
  apps: [
    {
      name: 'nmn-cinema-api',
      script: 'src/server.js',

      // Cluster mode - số instance = số CPU cores
      instances: 'max', // Hoặc số cụ thể như 4
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },

      // Restart configuration
      watch: false, // Tắt watch trong production
      max_memory_restart: '500M', // Restart nếu memory > 500MB

      // Auto restart on failure
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Logs
      log_file: './logs/pm2/combined.log',
      out_file: './logs/pm2/out.log',
      error_file: './logs/pm2/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Instance variables
      instance_var: 'INSTANCE_ID'
    }
  ],

  // Deployment configuration (Optional - for remote deploy)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:NguyenManhNinh/NMN-CENIMA.git',
      path: '/var/www/nmn-cinema',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
