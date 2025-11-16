import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(
      `Erreur lors de la hachage du mot de passe : ${error.message}`
    );
    throw new Error('Erreur lors de la hachage du mot de passe');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(
      `Erreur lors de la comparaison du mot de passe : ${error.message}`
    );
    throw new Error('Erreur lors de la comparaison du mot de passe');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('Utilisateur déjà inscrit');
    }

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
      });

    logger.info(`Nouvelle inscription de l'utilisateur ${email}`);
    return newUser;
  } catch (error) {
    logger.error(
      `Erreur lors de l'inscription de l'utilisateur ${email} : ${error}`
    );
    throw new Error('Erreur lors de l\'inscription de l\'utilisateur');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    const user = existingUser[0];

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }

    logger.info(`Authentification réussie pour l'utilisateur ${email}`);
    return user;
  } catch (error) {
    logger.error(
      `Erreur lors de l'authentification de l'utilisateur ${email} : ${error}`
    );
    throw error;
  }
};
