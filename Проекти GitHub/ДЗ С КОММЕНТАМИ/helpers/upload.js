import multer from "multer";
import path from "node:path";

const tmpDir = path.resolve("tmp");

const multerConfig = multer.diskStorage({
  destination: tmpDir,
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multerConfig,
});

export default upload;
// import path from "node:path";
// import crypto from "node:crypto";

// import multer from "multer";

// const multerConfig = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve("temp"));
//   },
//   filename: function (req, file, cb) {
//     // file.originalname = TrevorPhilips-GTAV.png
//     const extname = path.extname(file.originalname); // .png
//     console.log({ extname });
//     const basename = path.basename(file.originalname, extname); // TrevorPhilips-GTAV
//     console.log({ basename });
//     const suffix = crypto.randomUUID();

//     const filename = `${basename}--${suffix}${extname}`;

//     cb(null, filename);
//   },
// });
// const upload = multer({
//   storage: multerConfig,
// });
// export default upload;
