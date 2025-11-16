import { signupSchema, signinSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation non aboutie',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if (!isValidEmail) {
      logger.error(`Email non valide : ${email}`);
      return res.status(400).json({
        error: 'Vous devez renseigner un email valide!',
      });
    }

    const newUser = await createUser({ name, email, password, role });

    const token = jwttoken.sign({ id: newUser.id, email: newUser.email, role: newUser.role });

    cookies.set(res, 'token', token);

    logger.info(`Nouvel utilisateur inscrit : ${name} (${email})`);
    res.status(201).json({
      message: 'Utilisateur inscrit avec succès',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription', error);

    if (error.message === 'Utilisateur déjà inscrit') {
      return res.status(409).json({
        error: 'Utilisateur déjà inscrit',
      });
    }

    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation non aboutie',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`Utilisateur connecté : ${email}`);
    return res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion', error);

    if (error.message === 'Utilisateur non trouvé' || error.message === 'Mot de passe incorrect') {
      return res.status(401).json({
        error: 'Identifiants invalides',
      });
    }

    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (token) {
      cookies.clear(res, 'token');
      logger.info('Utilisateur déconnecté');
    } else {
      logger.info('Aucun token trouvé lors de la déconnexion');
    }

    return res.status(200).json({
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    logger.error('Erreur lors de la déconnexion', error);
    next(error);
  }
};
