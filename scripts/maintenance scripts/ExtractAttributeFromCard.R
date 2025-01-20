library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/tmp/"
files <- list.files(folder_path)

file <- "OP01-001.png"

img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))

img_info <- image_info(img)
width <- img_info$width
height <- img_info$height

x_center <- 44# X-coordinate of the circle center
y_center <- height - 43  # Y-coordinate of the circle center
radius <- 35     # Radius of the circle

mask <- image_blank(width, height, color = "none")

mask <- image_draw(mask)
symbols(x = x_center, y = y_center, circles = radius, inches = FALSE, add = TRUE, fg = "white", bg = "white")
dev.off()
temp_mask_path <- tempfile(fileext = ".png")
image_write(mask, path = temp_mask_path, format = "png")
mask <- image_read(temp_mask_path)
img_cropped <- image_composite(img, mask, operator = "copyopacity")
print(img_cropped)

circular_image <- image_crop(img_cropped, geometry = "77x77+9+760")
print(circular_image)

image_write(circular_image, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/LEADER_RED.png"))
