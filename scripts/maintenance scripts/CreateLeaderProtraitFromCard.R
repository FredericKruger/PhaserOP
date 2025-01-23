library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/tmp/"
files <- list.files(folder_path)

file <- "OP03-099.png"

img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))

img_info <- image_info(img)
width <- img_info$width
height <- img_info$height

x_center <- width/2 +100# X-coordinate of the circle center
y_center <- 140  # Y-coordinate of the circle center
radius <- 100

resize_radius <- 100

mask <- image_draw(image_blank(width = width, height = height, color = "none"))
polygon(x = c(x_center - radius, x_center + radius, x_center + radius, x_center - radius), 
        y = c(y_center + radius, y_center + radius, y_center - radius, y_center - radius), 
        col = "white", border = "white")
dev.off()
temp_mask_path <- tempfile(fileext = ".png")
image_write(mask, path = temp_mask_path, format = "png")
mask <- image_read(temp_mask_path)
img_cropped <- image_composite(img, mask, operator = "copyopacity")
print(img_cropped)

geom <- paste0(radius*2, "x", radius*2, "+", x_center-radius, "+", y_center-radius)
circular_image <- image_crop(img_cropped, geometry = geom)
resized_img <- image_scale(circular_image, paste0("x", resize_radius))
print(resized_img)

image_write(resized_img, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/leaderart_OP03-099.png"))
