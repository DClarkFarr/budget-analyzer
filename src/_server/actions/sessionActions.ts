"use server";

import { User } from ".prisma/client";
import { getIronSessionInstance } from "@/server/methods/session";
import { findUserById } from "@/server/prisma/user.methods";

export const initializeSession = async (user: User) => {
  const session = await getIronSessionInstance();
  session.user = user;
  await session.save();
};

export const destroySession = async () => {
  const session = await getIronSessionInstance();
  session.destroy();
};

export const getSessionUser = async () => {
  const session = await getIronSessionInstance();
  if (!session.user) {
    throw new Error("No session user");
  }
  return await findUserById(session.user.id);
};
