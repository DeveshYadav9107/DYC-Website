import Inquiry from '../models/Inquiry.js';
import ApiError from '../utils/apiError.js';
import { successResponse } from '../utils/apiResponse.js';

export const createInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    return successResponse(res, 201, 'Inquiry submitted successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Inquiries retrieved successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

export const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Inquiry not found'));
    }
    return successResponse(res, 200, 'Inquiry retrieved successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!inquiry) {
      return next(new ApiError(404, 'Inquiry not found'));
    }
    return successResponse(res, 200, 'Inquiry status updated', inquiry);
  } catch (error) {
    next(error);
  }
};

export const addInquiryNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return next(new ApiError(404, 'Inquiry not found'));
    }

    inquiry.notes.push({ text, addedBy: req.user.id });
    await inquiry.save();

    return successResponse(res, 200, 'Note added successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Inquiry not found'));
    }
    return successResponse(res, 200, 'Inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};
