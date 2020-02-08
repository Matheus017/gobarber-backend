import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    /**
     * Verifica se o token é valido.
     * Se o token for válido, as informações passadas via payload (do Session Controller)
     * serão retornadas.
     * Caso contrário, a função entra no bloco catch.
     */
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Passando o id do usuário para a requisição
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid.' });
  }
};
