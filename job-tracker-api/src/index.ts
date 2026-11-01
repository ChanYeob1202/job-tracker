import "dotenv/config";
import { app } from "./app.js";
import { pool } from "./db/pool.js";

/* 
Starts the server: reads the port and begins listening for requests.
*/

const port = 3001;

async function start() {
  await pool.query(`SELECT 1`); // wait here until the database answers
  app.listen(port, () => {
    console.log(`app listeting on port ${port}`); // only reached if the line above succeeded
  });
}

start();
