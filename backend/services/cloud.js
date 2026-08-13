// services/cloud.js
import cloudinary from "cloudinary";
import Config from "../models/config.js";

/**
 * Ensures req.config is populated
 */
const ensureConfig = async (req) => {
  if (!req.config) {
    req.config = await Config.getConfig();
  }
};

const updateConfig = async (req) => {
  await ensureConfig(req);
  cloudinary.config({

    cloud_name: req.config?.cloud.name || process.env.CLOUDINARY_CLOUD_NAME,
    api_key:
      req.config?.apiKeys?.cloudinary?.apikey || process.env.CLOUDINARY_API_KEY,
    api_secret:
      req.config?.apiKeys?.cloudinary?.apiSecret ||
      process.env.CLOUDINARY_API_SECRET,
  });
};

// Upload file to Cloudinary
export const uploadFile = async (req, filePath, options = {}) => {
  await updateConfig(req);

  try {

    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || "general",
      ...options,
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete single file from Cloudinary
export const deleteFile = async (req, publicId) => {
  await updateConfig(req);

  try {

    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok", result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete all files in a folder
export const deleteFolderFiles = async (req, folderPath) => {
  await updateConfig(req);

  try {

    // Get all files in the folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 500,
    });

    if (!result.resources.length) {
      return { success: true, message: "Folder is empty", deletedCount: 0 };
    }

    // Get all public IDs
    const publicIds = result.resources.map((resource) => resource.public_id);

    // Delete all files
    const deleteResult = await cloudinary.api.delete_resources(publicIds);

    const deletedCount = Object.keys(deleteResult.deleted).length;

    return {
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} files from ${folderPath}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Move/Rename file (move from temp to permanent)
export const moveFile = async (req, oldPublicId, newPublicId, options = {}) => {
  await updateConfig(req);

  try {

    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      overwrite: true,
      invalidate: true,
      ...options,
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single file info
export const getFile = async (req, publicId) => {
  await updateConfig(req);

  try {

    const result = await cloudinary.api.resource(publicId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all files from a folder
export const getFiles = async (req, folder, options = {}) => {
  await updateConfig(req);

  try {

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: options.maxResults || 100,
    });
    return { success: true, data: result.resources };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  uploadFile,
  deleteFile,
  deleteFolderFiles,
  moveFile,
  getFile,
  getFiles,
};
