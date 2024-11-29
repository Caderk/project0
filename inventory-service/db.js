const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USER || 'inventory_user',
    password: process.env.DATABASE_PASSWORD || 'inventory_pass',
    database: process.env.DATABASE_NAME || 'inventory_db',
});

module.exports = pool;
