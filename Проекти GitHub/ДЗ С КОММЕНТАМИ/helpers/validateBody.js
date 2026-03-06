import HttpError from "./HttpError.js";

const validateBody = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;
// const { error } = createContactSchema.validate(contact, {
//   abortEarly: false,
// });
//   // метод validate відповідає чи поля об'єкта відповідають схемі і повертає об'єкт рез-ту з полем error
// if (error) {
//     return res.status(400).json({ message: error.message }); }
// помилка валідації (передані поля не відповідають схемі валідації)
