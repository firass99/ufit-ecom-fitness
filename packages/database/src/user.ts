import { prisma } from './client';

export async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function createUser(
  email: string,
  fullName: string,
  password: string,
) {
  return prisma.user.create({
    email,
    fullName,
    password,
  });
}

export async function updateUser(
  userId: string,
  email: string,
  fullName: string,
  password: string,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      email,
      fullName,
      password,
    },
  });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUsers() {
  return prisma.user.findMany();
}
