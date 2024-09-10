const { Op } = require("sequelize");
const Joi = require("joi");
const sendApiResponse = require("../utils/apiResponse");
const { dateRangeSchema } = require("../utils/validations/professionValidator");
const { sequelize } = require("../models/model");

const getBestProfession = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const { start, end } = req.query;

  const { error } = dateRangeSchema.validate({ start, end });
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
    const result = await Job.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Job.price")), "totalEarned"],
        [sequelize.col("Contract.Contractor.profession"), "profession"],
      ],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: "Contractor",
              attributes: [],
            },
          ],
        },
      ],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [new Date(start), new Date(end)],
        },
      },
      group: ["Contract.Contractor.profession"],
      order: [[sequelize.fn("SUM", sequelize.col("Job.price")), "DESC"]],
      raw: true,
    });

    if (!result) {
      return sendApiResponse(
        res,
        404,
        "No paid jobs found in the specified date range"
      );
    }

    sendApiResponse(res, 200, "Best profession retrieved successfully", {
      profession: result.profession,
      totalEarned: result.totalEarned,
    });
  } catch (error) {
    console.error("Error retrieving best profession:", error);
    sendApiResponse(res, 500, "Internal server error", null, error.message);
  }
};

const getBestClients = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const { start, end, limit = 2 } = req.query;

  const { error, value } = dateRangeSchema.validate({ start, end, limit });
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
    const results = await Job.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Job.price")), "paid"],
        [sequelize.col("Contract.Client.id"), "id"],
        [
          sequelize.fn(
            "CONCAT",
            sequelize.col("Contract.Client.firstName"),
            " ",
            sequelize.col("Contract.Client.lastName")
          ),
          "fullName",
        ],
      ],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: "Client",
              attributes: [],
            },
          ],
        },
      ],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [new Date(value.start), new Date(value.end)],
        },
      },
      group: ["Contract.Client.id"],
      order: [[sequelize.fn("SUM", sequelize.col("Job.price")), "DESC"]],
      limit: value.limit,
      raw: true,
    });

    if (results.length === 0) {
      return sendApiResponse(
        res,
        404,
        "No paid jobs found in the specified date range"
      );
    }

    const formattedResults = results.map((result) => ({
      id: result.id,
      fullName: result.fullName,
      paid: parseFloat(result.paid).toFixed(2),
    }));

    sendApiResponse(
      res,
      200,
      "Best clients retrieved successfully",
      formattedResults
    );
  } catch (error) {
    console.error("Error retrieving best clients:", error);
    sendApiResponse(res, 500, "Internal server error", null, error.message);
  }
};

module.exports = {
  getBestProfession,
  getBestClients,
};
