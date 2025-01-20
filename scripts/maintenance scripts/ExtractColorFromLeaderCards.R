library(magick)

folder_path <- "c:/Users/Kruger_F1/Pictures/tmp/"
files <- list.files(folder_path)

file <- "OP03-099.png"

img <- image_read(paste0("c:/Users/Kruger_F1/Pictures/tmp/", file))

img_info <- image_info(img)
width <- img_info$width
height <- img_info$height

x_center <- 45.# X-coordinate of the circle center
y_center <- height - 44  # Y-coordinate of the circle center
x_radius <- 29.25     # Radius of the circle
y_radius <- 32.5
angle <- 0.43

#mask <- image_blank(width, height, color = "none")

#mask <- image_draw(mask)
#symbols(x = x_center, y = y_center, circles = radius, inches = FALSE, add = TRUE, fg = "white", bg = "white")
#dev.off()
mask <- image_draw(image_blank(width = width, height = height, color = "none"))
#polygon(x = c(x_center-x_radius, x_center+x_radius, x_center+x_radius, x_center-x_radius), 
#        y = c(y_center-y_radius, y_center-y_radius, y_center+y_radius, y_center+y_radius), col = "white", border = "white")
polygon(x = c(x_center, x_center+x_radius, x_center+x_radius, x_center, x_center-x_radius, x_center-x_radius), 
        y = c(y_center-y_radius,y_center-y_radius*angle, y_center+y_radius*angle, y_center+y_radius, y_center+y_radius*angle, y_center-y_radius*angle), col = "white", border = "white")
dev.off()
temp_mask_path <- tempfile(fileext = ".png")
image_write(mask, path = temp_mask_path, format = "png")
mask <- image_read(temp_mask_path)
img_cropped <- image_composite(img, mask, operator = "copyopacity")
print(img_cropped)

geom <- paste0(x_radius*2, "x", y_radius*2, "+", x_center-x_radius, "+", y_center-y_radius)
circular_image <- image_crop(img_cropped, geometry = geom)
print(circular_image)

image_write(circular_image, paste0("c:/Users/Kruger_F1/Pictures/resizedtmp/LEADER_YELLOW.png"))
