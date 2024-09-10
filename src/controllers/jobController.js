const { Op } = require("sequelize");
const sendApiResponse = require("../utils/apiResponse");
const { payJobSchema } = require("../utils/validations/jobValidator");
const { sequelize } = require("../models/model");

const getUnpaidJobs = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const profileId = req.profile.id;

  try {
    const unpaidJobs = await Job.findAll({
      include: [
        {
          model: Contract,
          where: {
            status: "in_progress",
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
          },
          include: [
            {
              model: Profile,
              as: "Client",
            },
            {
              model: Profile,
              as: "Contractor",
            },
          ],
        },
      ],
      where: {
        paid: { [Op.not]: true },
      },
    });

    if (unpaidJobs.length === 0) {
      return sendApiResponse(
        res,
        404,
        "No unpaid jobs found for active contracts"
      );
    }

    sendApiResponse(res, 200, "Unpaid jobs retrieved successfully", unpaidJobs);
  } catch (error) {
    console.error("Error fetching unpaid jobs:", error);
    sendApiResponse(res, 500, "Internal server error", null, error.message);
  }
};

const payJob = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const clientId = req.profile.id;
  const { job_id } = req.params;

  const { error } = payJobSchema.validate({ job_id });
  if (error) {
    return sendApiResponse(
      res,
      400,
      "Invalid input",
      null,
      error.details[0].message
    );
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const job = await Job.findOne({
        where: { id: job_id, paid: { [Op.not]: true } },
        include: [
          {
            model: Contract,
            where: { status: "in_progress", ClientId: clientId },
            include: [{ model: Profile, as: "Contractor" }],
          },
        ],
        transaction: t,
      });

      if (!job) {
        throw new Error("Job not found or already paid");
      }

      const client = await Profile.findByPk(clientId, { transaction: t });

      if (client.balance < job.price) {
        throw new Error("Insufficient balance");
      }

      await client.update(
        { balance: client.balance - job.price },
        { transaction: t }
      );

      await job.Contract.Contractor.update(
        { balance: job.Contract.Contractor.balance + job.price },
        { transaction: t }
      );

      await job.update(
        { paid: true, paymentDate: new Date() },
        { transaction: t }
      );

      return job;
    });

    sendApiResponse(res, 200, "Payment successful", result);
  } catch (error) {
    console.error("Error processing payment:", error);
    sendApiResponse(res, 400, error.message);
  }
};

module.exports = {
  getUnpaidJobs,
  payJob,
};
