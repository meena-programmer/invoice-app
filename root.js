import https from "node:http";
import app from "./app.js";
// import fs from "node:fs";

const PORT = normalizePort(process.env.PORT || 3000);
app.set("port", PORT);

/**
 * Create http Server
 */
// Read the SSL certificate and key files
// const options = {
//   key: fs.readFileSync("path/to/private/key.pem"),
//   cert: fs.readFileSync("path/to/certificate.pem"),
// };

const server = https.createServer(app);
server.listen(PORT, () => console.log(`Invoice App running on PORT ${PORT}`));

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
