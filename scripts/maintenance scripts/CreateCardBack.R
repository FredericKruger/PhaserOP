library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/"
file <- "don-sleeve-0.png"

#for(file in  files) {
  img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/", file))
  cropped_image <- image_crop(img, "546x799+27+9") #600 #838
  print(cropped_image)
  
  # Create a rounded corners mask
  mask <- image_draw(image_blank(width = image_info(cropped_image)$width, height = image_info(cropped_image)$height, color = "none"))
  grid::grid.roundrect(x = 0.5, y = 0.5, width = 1, height = 1, r = unit(25, "pt"), gp = grid::gpar(fill = "white", col = NA))
  dev.off()
  img_rounded <- image_composite(cropped_image, mask, operator = "copyopacity")

  resized_img <- image_resize(img_rounded, "600x838!")
  print(resized_img)
  image_write(resized_img, paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))
#}