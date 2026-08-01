import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signBusinessToken = (payload) =>
  jwt.sign(payload, env.jwt.businessSecret, { expiresIn: env.jwt.expiresIn });

export const verifyBusinessToken = (token) => jwt.verify(token, env.jwt.businessSecret);

export const signAdminToken = (payload) =>
  jwt.sign(payload, env.jwt.adminSecret, { expiresIn: env.jwt.expiresIn });

export const verifyAdminToken = (token) => jwt.verify(token, env.jwt.adminSecret);
