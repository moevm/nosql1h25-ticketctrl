import neo4j from 'neo4j-driver';



const driver = neo4j.driver(
    process.env.NEO4J_URI,  // <- вот эта переменная сейчас undefined
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

console.log('Connecting to Neo4j at:', process.env.NEO4J_URI);

export function getSession() {
    return driver.session();
}
