import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "secure_secret_key";
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY);

interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

const REFRESH_SECRET_KEY =
  process.env.REFRESH_SECRET_KEY || "secure_refresh_secret_key";
const ENCODED_REFRESH_KEY = new TextEncoder().encode(REFRESH_SECRET_KEY);

export const signAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
};

export const signRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

export const verifyAccessToken = async (
  token: string
): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, ENCODED_KEY);
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error("Access Token verification failed:", error);
    return null;
  }
};

export const verifyRefreshToken = async (
  token: string
): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, ENCODED_REFRESH_KEY);
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error("Refresh Token verification failed:", error);
    return null;
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (plain: string, hashed: string) => {
  return await bcrypt.compare(plain, hashed);
};
