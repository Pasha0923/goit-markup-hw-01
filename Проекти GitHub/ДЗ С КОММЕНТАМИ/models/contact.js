import mongoose from "mongoose";
import { Schema } from "mongoose";
import handleMongooseError from "../helpers/handleMongooseError.js";
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false, // якщо не передаємо поле favorite , то воно створються автоматично зі значенням false
    },
    owner: {
      type: Schema.Types.ObjectId, // тут буде зберігатись Id людини яка додала книгу , його генерує mongoDB
      ref: "user", // назва колекції з якої буде це Id
    },
  },
  {
    versionKey: false, // відключаємо версію документа
    timestamps: true, // формат (дата створення/дата оновлення документа)
  }
);
contactSchema.post("save", handleMongooseError);
export default mongoose.model("Contact", contactSchema);
// на основі схемки створюємо модель. Викликаємо у mongoose метод model(). Ім'я моделі в однині
// export default mongoose.model("Contact", contactSchema); // contacts (назва колекції повинна бути в множині в нижному регістрі)
