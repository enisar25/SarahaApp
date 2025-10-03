// src/DB/DBservices.js
// Generic database services for CRUD operations using Mongoose models

export const findOne = async (model, filter, populate = null, select = null) => {
  let query = model.findOne(filter);
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  return await query;
};

export const find = async ( model, filter = {}, select = null,
  sort = null, skip = 0, limit = null, populate = null ) => {

  let query = model.find(filter);
  if (select) query = query.select(select);
  if (sort) query = query.sort(sort);
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);
  if (populate) query = query.populate(populate);
  return await query;
};

export const findAll = async (model, populate = null, select = null) => {
  let query = model.find();
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  return await query;
};

export const findById = async (model, id, populate = null, select = null) => {
  let query = model.findOne({ _id: id , 'deleted.deletedAt': null });
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  return await query;
};

export const findDeleted = async (model, id, populate = null, select = null) => {
  let query = model.findOne({ _id: id, 'deleted.deletedAt': { $ne: null }, });
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  return await query;
};

export const create = async (model, data = {}) => {
  return await model.create(data);
};

export const createMany = async (model, data = []) => {
  // ordered:false lets Mongo insert the rest if one doc fails
  return await model.insertMany(data, { ordered: false });
};

export const updateById = async (
  model,
  id,
  data = {},
  options = { new: true, runValidators: true }
) => {
  return await model.findByIdAndUpdate(id, data, options);
};

export const updateMany = async (model, filter, data = {}, options = {}) => {
  return await model.updateMany(filter, data, options);
};

export const deleteById = async (model, id) => {
  return await model.findByIdAndDelete(id);
};

export const deleteMany = async (model, filter) => {
  return await model.deleteMany(filter);
};

export const countDocuments = async (model, filter = {}) => {
  return await model.countDocuments(filter);
};

export const aggregate = async (model, pipeline) => {
  return await model.aggregate(pipeline);
};
