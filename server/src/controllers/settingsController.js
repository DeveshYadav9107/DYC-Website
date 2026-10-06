import SiteSettings from '../models/SiteSettings.js';
import ApiError from '../utils/apiError.js';
import { successResponse } from '../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return successResponse(res, 200, 'Site settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      settings = await SiteSettings.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }
    return successResponse(res, 200, 'Site settings updated', settings);
  } catch (error) {
    next(error);
  }
};
