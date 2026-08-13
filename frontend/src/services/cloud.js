// services/uploadService.js
import axios from "axios";
import api from './api';


const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "busypilot";


// Direct upload to Cloudinary from browser
export const uploadToTemp = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "uploads/images"); // Use asset_folder or folder
    formData.append("asset_folder", "uploads/images"); // Alternative

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload to permanent folder
export const uploadToPermanent = async (file, storeId, itemId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `uploads/permanent/${storeId}/${itemId || Date.now()}`);
    formData.append("asset_folder", `uploads/permanent/${storeId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get optimized image URL
export const getOptimizedImage = (url, options = {}) => {
  if (!url) return null;
  
  const { width = 500, quality = "auto", format = "auto" } = options;
  
  if (!url.includes("cloudinary.com")) return url;
  
  let transformations = [`q_${quality}`, `f_${format}`];
  if (width) transformations.push(`w_${width}`);
  
  return url.replace("/upload/", `/upload/${transformations.join(",")}/`);
};

export const cloudAPI = {
  // Delete a single file by public ID
  deleteFile: (publicId) => api.delete(`/cloud/file?publicId=${publicId}`),
};



export default {
  uploadToTemp,
  uploadToPermanent,
  getOptimizedImage,
  cloudAPI
};
