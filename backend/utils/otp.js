exports.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.getExpiryTime = () =>
  new Date(Date.now() + 5 * 60 * 1000);
