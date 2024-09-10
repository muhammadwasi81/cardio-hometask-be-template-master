const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("../models/model");
const { getProfile } = require("../middleware/getProfile");
const {
  getContractById,
  getContracts,
} = require("../controllers/contractController");
const { getUnpaidJobs, payJob } = require("../controllers/jobController");
const { depositToBalance } = require("../controllers/balanceController");
const {
  getBestProfession,
  getBestClients,
} = require("../controllers/adminController");

const app = express();
const API_PREFIX = `/api/v1/`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// Existing routes
app.get(`${API_PREFIX}contracts/:id`, getProfile, getContractById);
app.get(`${API_PREFIX}contracts`, getProfile, getContracts);

// New route for getting unpaid jobs
app.get(`${API_PREFIX}jobs/unpaid`, getProfile, getUnpaidJobs);
app.post(`${API_PREFIX}jobs/:job_id/pay`, getProfile, payJob);

app.post(`${API_PREFIX}balances/deposit/:userId`, getProfile, depositToBalance);

app.get(`${API_PREFIX}admin/best-profession`, getBestProfession);
app.get(`${API_PREFIX}admin/best-clients`, getBestClients);

app.get("/", async (req, res) => {
  res.send("API is running...");
});

module.exports = app;
