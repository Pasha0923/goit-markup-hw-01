import mongoose from "mongoose";
import handleMongooseError from "../helpers/handleMongooseError.js";
export const subscriptionList = ["starter", "pro", "business"];

// створюємо модель користувача user яку будемо зберігати в базі даних!
const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      // підписка
      type: String,
      enum: subscriptionList,
      default: "starter", // якщо не передано поле subscription , то воно створються автоматично зі значенням starter
    },
    // коли користувач зробить logout то token стане не валідним
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      // посилання на аватарку користувача яку він завантажить (видаємо avatarURL під час реєстрації)
      type: String,
      required: true,
    },
    verify: {
      type: Boolean, // чи верифікував свій email користувач чи ні
      default: false, // коли людина зареэструвалась але не підтвердила
    },
    verificationToken: {
      // код підтвердження який буде приходити користувачу на пошту (генеруємо nanoid)
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  {
    versionKey: false, // відключаємо версію документа
    timestamps: true, // формат (дата створення/дата оновлення документа)
  }
);
userSchema.post("save", handleMongooseError);
export default mongoose.model("User", userSchema);
