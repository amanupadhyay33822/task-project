const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
require("dotenv").config();

const swaggerDocument = YAML.load("./swagger.yml");

// Override the servers URL dynamically
swaggerDocument.servers = [
  {
    url: process.env.API_BASE_URL || "http://localhost:5000/api",
    description: "Environment Server",
  },
];

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
