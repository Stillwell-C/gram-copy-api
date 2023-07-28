const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
});

const generateSignature = (timestamp) => {
  return cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    cloudinaryConfig.api_secret
  );
};

const generateExpectedSignature = (public_id, version) => {
  return cloudinary.utils.api_sign_request(
    { public_id, version },
    cloudinaryConfig.api_secret
  );
};

const deleteImageFromCloudinary = (public_id) => {
  cloudinary.uploader.destroy(public_id);
};

module.exports = {
  generateSignature,
  generateExpectedSignature,
  deleteImageFromCloudinary,
};
