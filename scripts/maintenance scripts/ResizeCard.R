library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/tmp/"
files <- list.files(folder_path)

for(file in  files) {
  img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))
  resized_img <- image_resize(img, "600x838")
  image_write(resized_img, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/", file))
}
