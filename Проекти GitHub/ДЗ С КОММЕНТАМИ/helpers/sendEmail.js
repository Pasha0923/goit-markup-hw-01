import nodemailer from "nodemailer";
import "dotenv/config";
// відпраляємо email через поштовий сервер замовника (yahoo, gmail, meta.ua), ми маємо підключитись до нього і через нього відправляти
// пакет nodemailer npm i nodemailer
const { META_PASSWORD } = process.env;
// перед тим як відправляти пошту через nodemailer , робимо об'єкт налаштувань
const nodemailerConfig = {
  // nodemailerConfig об'єкт налаштувань
  host: "smtp.meta.ua", // хост поштового серверу мета
  port: 465, //25, 465, 2525
  secure: true, // чи треба шифрувати
  auth: {
    // об'єкт в якого вказуємо user - обєкт до якого підключаємося пошта
    user: "pavelsai@meta.ua", // пошта
    pass: META_PASSWORD, // пароль до цієї пошти
  },
};
// обєкт transport - це обєкт який буде займатися відправкою пошти
const transport = nodemailer.createTransport(nodemailerConfig);
// функція для відправки листа
const sendEmail = async (data) => {
  const email = { ...data, from: "pavelsai@meta.ua" };
  await transport.sendMail(email);
  return true;
};
export default sendEmail;
