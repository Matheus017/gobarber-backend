import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid request.' });
    }

    const userAlreadyExists = await User.findOne({
      where: { email: req.body.email },
    });
    if (userAlreadyExists) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      /**
       * O método when do campo confirmPassword verifica se o campo
       * password foi preenchido e caso tenha sido, torna confirmPassword
       * required.
       * Já o método oneOf verifica se o confirmPassword é igual a um
       * dos itens do array.
       * O array possui apenas um item, que é o retorno do método Yup.ref,
       * nesse caso o próprio password informado.
       * Caso os dois campos (password e confirPassword) não sejam iguais,
       * a requisição não será válida.
       */
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Password does not match.' });
    }

    const { email, oldPassword } = req.body;
    // Buscando o usuário a partir da primary key (id)
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userAlreadyExists = await User.findOne({
        where: { email },
      });
      if (userAlreadyExists) {
        return res.status(400).json({ error: 'Email already registered.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
