import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import gravatar from "gravatar";
import path from "node:path";
import * as fs from "node:fs/promises";
import jimpAvatar from "../helpers/jimpAvatar.js";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const { SECRET_KEY, BASE_URL } = process.env;

// const avatarsDir = path.resolve("public", "avatars"); // новий абсолютний шлях до папки avatars в якій знаходиться файл
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user !== null) {
      throw HttpError(409, "User already registered"); // якщо користувач в базі з таким emailom вже є то викидаємо помилку з текстом
    }
    // return res.status(409).send({ message: "User already registered" });

    // ЯКЩО ЛЮДИНи в базі нема то хешуємо її пароль
    const hashPassword = await bcrypt.hash(password, 10); // викликаємо метод hash (перший арг назва поля яке хешуэмо , кількість солі )
    // Зберігаємо користувача в базі (const newUser)
    // (в полі пароль зберігаємо його в захешованому вигляді "$2b$10$rE6F9mpCCjSQAbxBJE2ZxOI3QJ2mM6C2FJrnOOGoOcCAqophjsQJG")

    // для генерації тимчасової аватарки у користувача використовуємо пакет gravavatar а потім треба дати йому окремий роут для того щоб цю аватарку змінити
    const avatarURL = gravatar.url(email); // щоб згенерувати посилання на тимчасову ватарку треба викликати метод url і передати email людини яка хоче зареєструватися і нам повертається посилання на тимчасову аватарку

    // при реєстрації користувача створюэмо у нього в базі код підтвердження(verificationToken) який буде приходити на пошту і записуємо його в базі
    // генеруємо verificationToken за допомогою nanoid

    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL, // ми її зберігаємо в базі і коли людина реєструється їй буде надаватися тимчасова аватарка
      verificationToken,
      // Треба дати можливість людині змінити аватарку (тобто відправити на певну адресу нову аватарку і ми її замінимо)
    });
    // створюємо email на підтвердження
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`,
    };
    // відсилаємо email
    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
}
async function verifyEmail(req, res, next) {
  try {
    // після реєстрації користувача переходимо по цьому маршруту і ставимо в кінці verificationToken який створився в базі даних і по ньому шукаємо користувача
    //GET  http://localhost:4000/api/users/verify/4r37AJvGbLX1nHRhjR7p-
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken }); // перевіряємо чи є в базі людина з таким verificationToken
    if (!user) {
      throw HttpError(404, "User not found"); // якщо такого користувачв з таким verificationToken немає то викидаємо помилку 404
    }
    // якщо така людина є то оновлюємо базу даних
    await User.findByIdAndUpdate(user._id, {
      verify: true, // поле verify=true , тобто людина підтвердила email , перешла по посиланню , ввела правильний код
      verificationToken: null,
    });
    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
}
async function resendVerifyEmail(req, res, next) {
  //localhost:4000/api/users/verify
  try {
    //  if (!req.body || Object.keys(req.body).length === 0) {
    //    throw HttpError(400, "missing required field email");
    //  } else if (
    //    Object.keys(req.body).length !== 1 ||
    //    !Object.keys(req.body).includes("email")
    //  ) {
    //    return res.status(400).json({
    //      message: "Body must have one field: email",
    //    });
    //  }
    const { email } = req.body; // беремо з req.body email на який треба відіслати лист з підтвердженням
    const user = await User.findOne({ email }); // перевіряємо чи є користувач з таким emailom в базі
    if (!user) {
      // якщо його немає викидаємо помилку
      throw HttpError(404, "Email not found");
    }
    if (user.verify) {
      // якщо людина вже верифікована (якщо людина підтвердила свій email)
      throw HttpError(400, "Verification has already been passed");
    }
    // Якщо ж є такий email , а людина не підтвердила то треба повторно відправити лист з підтв. на вказаний email
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`,
    };
    // відправляємо лист з підтвердженням
    await sendEmail(verifyEmail);

    res.status(200).json({
      message: "Verification email was sent",
    });
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    const { email, password, subscription = "starter" } = req.body; // в postman передаємо в тіло запиту користувача з email і password з бази даних http://localhost:3000/api/auth/login
    // якщо успішно авторизувались(залогінились) база повертає token
    // Перед тим як людину залогінити перевіряємо чи є вже такий користувач в базі з таким emailom?
    const user = await User.findOne({ email });
    console.log("user: ", user);
    if (!user) {
      // Якщо його немає то викидаємо помилку (неавторизований 401 помилка)
      throw HttpError(401, "Email or password invalid");
    }
    // ПЕРЕВІРКА на те , що якщо людина яка ще не підтвердила email , не могла залогінитися робимо перевірку!
    // якщо людина не підтвердила email , то помилка 401
    if (!user.verify) {
      throw HttpError(401, "Email not verified");
    }
    // А якщо є такий користувач в базі то порівнюємо паролі
    const passwordCompare = await bcrypt.compare(password, user.password); // 1-й арг пароль який присилає з фронтенду , другий арг - пароль який зберігаэться в базі(захешований пароль)
    if (!passwordCompare) {
      // якщо паролі не співпадають (false) помилка 401
      throw HttpError(401, "Email or password invalid");
    }
    // створюємо об'єкт користувача payload (в якому зберігаються дані користуача , id з бази даних буде достатньо )
    const payload = {
      id: user._id,
    };
    // якщо паролі співпадають створюємо token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token }); // під час логіну людини ми його відсилаємо на фронтенд а також зберігаємо в базі даних
    res.json({
      // відправляємо його на фронтенд

      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}
async function getCurrent(req, res) {
  const { email, subscription = "starter" } = req.user; // беремо з req.user поля які необхідно відіслати людині

  res.json({
    email,
    subscription,
  });
}

async function logout(req, res, next) {
  try {
    const { _id } = req.user; // беремо id користувача який хоче розлогінитися
    await User.findByIdAndUpdate(_id, { token: "" }); // коли людина хоче розлогініитися видаляємо токен
    next(HttpError(204, "No content"));
  } catch (error) {
    next(error);
  }
}

async function updateSubscription(req, res, next) {
  if (
    Object.keys(req.body).length !== 1 ||
    !Object.keys(req.body).includes("subscription")
  ) {
    return res.status(400).json({
      message: "Body must have one field: subscription",
    });
  }
  try {
    const data = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      return next(HttpError(400, "File not found"));
    }
    console.log(req.file);
    const { _id: id } = req.user; // в req.user зберігається id користувача який робить запит , виягуємо його
    const { path: tmpUpload, originalname } = req.file;
    await jimpAvatar(tmpUpload);
    const fileName = `${id}-${originalname}`; // дописали id до originalname щоб отримати унікальне ім'я файлу щоб його не можна повторити
    const resultUpload = path.resolve("public/avatars", fileName); // створюємо новий шлях де він має зберігатися
    await fs.rename(tmpUpload, resultUpload); // переміщуємо аватар із папки temp в постійну папку public/avatars
    const avatarURL = path.join("avatars", fileName); // цей новий шлях записуємо в базу
    console.log(avatarURL);
    const user = await User.findByIdAndUpdate(id, { avatarURL }, { new: true }); // знаючи id нарешті можемо перезаписати avatarURL
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};
