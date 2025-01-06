module.exports = {
    apps : [{
        name   : "app",
        script : "./bin/server-runner.js",
        env_production: {
        NODE_ENV: "production"
        },
        env_development: {
        NODE_ENV: "development"
        }
    }]
}
