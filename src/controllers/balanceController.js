const { Op } = require("sequelize");
const sendApiResponse = require("../utils/apiResponse");
const { depositSchema } = require("../utils/validations/depositValidator");
const { sequelize } = require("../models/model");

const depositToBalance = async (req, res) => {
  const { Profile, Job, Contract } = req.app.get("models");
  const { userId } = req.params;
  const { amount } = req.body;

  const { error } = depositSchema.validate({ amount });
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
      const client = await Profile.findOne({
        where: { id: userId, type: "client" },
        transaction: t,
      });

      if (!client) {
        throw new Error("Client not found");
      }

      const totalJobsToPay = await Job.sum("price", {
        include: [
          {
            model: Contract,
            where: {
              status: "in_progress",
              ClientId: userId,
            },
          },
        ],
        where: {
          paid: { [Op.not]: true },
        },
        transaction: t,
      });

      if (amount > totalJobsToPay * 0.25) {
        throw new Error("Deposit amount exceeds 25% of total jobs to pay");
      }

      await client.update(
        { balance: client.balance + amount },
        { transaction: t }
      );

      return {
        message: "Deposit successful",
        newBalance: client.balance + amount,
      };
    });

    sendApiResponse(res, 200, result.message, {
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    sendApiResponse(res, 400, error.message);
  }
};

module.exports = {
  depositToBalance,
};
