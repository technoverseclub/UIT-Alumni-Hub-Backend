const alumniService = require("../services/alumni.service");

exports.createProfile = async (req, res) => {
  try {
    const profile = await alumniService.createProfile(
      req.user.id,
      req.body,
      req.file,
    );

    console.log("FILE:", req.file);

    res.status(201).json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await alumniService.getMyProfile(req.user.id);
    res.json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await alumniService.updateProfile(
      req.user.id,
      req.body,
      req.file,
    );
    res.json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await alumniService.deleteProfile(req.user.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getAllAlumni = async (req, res) => {
  const alumni = await alumniService.getAllAlumni();
  res.json(alumni);
};

exports.getAlumniById = async (req, res) => {
  const alumni = await alumniService.getAlumniById(req.params.id);
  res.json(alumni);
};
