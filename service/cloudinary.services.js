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

const deleteImageFromCloudinary = (imageKey) => {
  const public_id = imageKey.split(".");
  cloudinary.api.delete_resources(public_id[0], {
    type: "upload",
    resource_type: "image",
  });
};

module.exports = {
  generateSignature,
  generateExpectedSignature,
  deleteImageFromCloudinary,
};
