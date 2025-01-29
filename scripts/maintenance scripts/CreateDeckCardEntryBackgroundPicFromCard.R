library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/newtmp/"
files <- list.files(folder_path)

#file <- "OP01-004.png"

for(file in  files) {
  img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/newtmp/", file))
  cropped_image <- image_crop(img, "510x260+60+100")
  resized_img <- image_resize(cropped_image, "275x30!")
  extent_img <- image_extent(resized_img, '275x30', color = 'pink')
  image_write(extent_img, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/", paste0("deckentry_",file)))
}
