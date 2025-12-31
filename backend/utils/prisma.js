const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

console.log("Loaded Prisma models:", Object.keys(prisma));

module.exports = prisma;

