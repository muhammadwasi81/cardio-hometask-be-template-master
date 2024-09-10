const { Op } = require("sequelize");
const sendApiResponse = require("../utils/apiResponse");
const {
  getContractValidator,
} = require("../utils/validations/contractValidator");

const getContractById = async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const profileId = req.profile.id;

  const { error } = getContractValidator.validate({ id });
  if (error) {
    return sendApiResponse(res, 400, error.details[0].message);
  }
  try {
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
      },
    });

    if (!contract) {
      return sendApiResponse(res, 404, "Contract not found or access denied");
    }

    sendApiResponse(res, 200, "Contract retrieved successfully", contract);
  } catch (error) {
    console.error("Error fetching contract:", error);
    sendApiResponse(res, 500, "Internal server error", null, error.message);
  }
};

const getContracts = async (req, res) => {
  const { Contract } = req.app.get("models");
  const profileId = req.profile.id;

  try {
    const contracts = await Contract.findAll({
      where: {
        [Op.and]: [
          { status: { [Op.ne]: "terminated" } },
          {
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
          },
        ],
      },
    });

    if (contracts.length === 0) {
      return sendApiResponse(
        res,
        404,
        "No active contracts found for the user"
      );
    }

    sendApiResponse(res, 200, "Contracts retrieved successfully", contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    sendApiResponse(res, 500, "Internal server error", null, error.message);
  }
};

module.exports = {
  getContractById,
  getContracts,
};
