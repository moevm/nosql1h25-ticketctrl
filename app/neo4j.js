const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'strongpassword123'),
    { encrypted: 'ENCRYPTION_OFF' }
);


module.exports = driver;
