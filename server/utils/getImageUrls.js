const path = require("path");
const fs = require("fs");

const publicDirectory = path.join(__dirname, "../../client/public/images");
const baseUrl = "http://localhost:8000/public/images";

function getImageUrls(directory, baseUrl, callback) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return callback(err);
    }

    const imageUrls = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => path.join(baseUrl, file));

    return callback(null, imageUrls);
  });
}

getImageUrls(publicDirectory, baseUrl, (err, imageUrls) => {
  if (err) {
    console.error("Error reading image URLs:", err);
  } else {
    console.log("Image URLs:", imageUrls);
  }
});
