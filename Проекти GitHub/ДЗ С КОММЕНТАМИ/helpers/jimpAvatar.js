import Jimp from "jimp";
const jimpAvatar = async (filePath) => {
  // шлях до вихідного зображення
  try {
    const image = await Jimp.read(filePath); // зчитуємо шлях вихідного зображення
    image.resize(250, 250); // змінюємо розміри
    image.writeAsync(filePath); // зберігаємо змінене зображення з тим же шляхом
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default jimpAvatar;
