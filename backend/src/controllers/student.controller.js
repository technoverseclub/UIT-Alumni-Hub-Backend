const studentService = require("../services/student.service");

exports.createProfile = async (req, res) => {
  try {
    const profile = await studentService.createProfile(
      req.user.id,
      req.body,
      req.file, // 👈 pass file
    );
    res.status(201).json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await studentService.getMyProfile(req.user.id);
    res.json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await studentService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await studentService.getDashboard(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
