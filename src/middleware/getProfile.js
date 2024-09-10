const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get("models");
  const profileId = req.get("profile_id");
  console.log(`Received profile_id: ${profileId}`);

  const profile = await Profile.findOne({ where: { id: profileId || 0 } });

  if (!profile) {
    console.log(`No profile found for id: ${profileId}`);
    return res.status(401).json({ error: "Unauthorized - Invalid profile_id" });
  }

  console.log(`Profile found: ${JSON.stringify(profile)}`);
  req.profile = profile;
  next();
};

module.exports = { getProfile };
