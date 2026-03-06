// мідлвара на те щоб перевірити чи людина залогінена в базі чи ні ( робить запити get,post,put,delete по маршрутам)
// ТОБТО ЧИ прислала вона token і чи він валідний (функція authenticate імпортується в routes в маршрути)

import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "./HttpError.js";
const { SECRET_KEY } = process.env; // забираємо секретний ключ зі змінних оточення

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" "); // розділяємо строку на масив слів по пробілу
  // нульовий елемент масиву (тобто перше слово Bearer) потрапить в зміну bearer , перший елемент (сама строка токену) в змінну token.
  // перевірка чи є 0-й елемент словом "Bearer"
  if (bearer !== "Bearer") {
    next(HttpError(401, "Not Unauthorized"));
  }
  try {
    // перевірка на валідний token (чи шифрували token секретним ключем)
    const { id } = jwt.verify(token, SECRET_KEY); // метод verify перевіряє чи шифрували на бекенді token за допомогою SECRET_KEY і чи термін дії не занінчився
    console.log(" id: ", id); // якщо token валідний то повертається id людини з бази даних

    // перевірка чи є така  людина з токеном в базі яка робить запит по id findById(id)
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(HttpError(401, "Not Unauthorized"));
    }
    req.user = user; // записує людину в об'єкт req.user (записує інформація про людину яка зробила запит)
    next();
  } catch (error) {
    next(HttpError(401, "Not Unauthorized"));
  }
};

export default authenticate;
