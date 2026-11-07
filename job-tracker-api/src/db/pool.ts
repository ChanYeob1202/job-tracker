import pg from 'pg'
const { Pool } = pg; // blue print gets pool ( small group of connections ) many users can be served at the same time

export const pool = new Pool ({
    connectionString: process.env.DATABASE_URL, 
})

/* 
    pg is node-posgres, node.js library lets backend communicate with postgrSQL
    
    backend uses it to connect to db
    send sql queries

    receive results
    manage connections using a pool

    TODO - checks the database

*/





