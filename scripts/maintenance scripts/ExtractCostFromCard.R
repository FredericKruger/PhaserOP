library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/tmp/"
files <- list.files(folder_path)

file <- "OP03-123.png"

#for(file in  files) {
  img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))
  
  
  img_info <- image_info(img)
  width <- img_info$width
  height <- img_info$height
  
  x_center <- 55# X-coordinate of the circle center
  y_center <- 54  # Y-coordinate of the circle center
  radius <- 39     # Radius of the circle
  
  mask <- image_blank(width, height, color = "none")
  
  mask <- image_draw(mask)
  symbols(x = x_center, y = y_center, circles = radius, inches = FALSE, add = TRUE, fg = "white", bg = "white")
  dev.off()
  temp_mask_path <- tempfile(fileext = ".png")
  image_write(mask, path = temp_mask_path, format = "png")
  mask <- image_read(temp_mask_path)
  img_cropped <- image_composite(img, mask, operator = "copyopacity")
  circular_image <- image_crop(img_cropped, geometry = "80x80+15+14")
  print(circular_image)

  image_write(circular_image, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/YELLOW_8.png"))
#}