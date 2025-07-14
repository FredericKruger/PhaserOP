library(magick)
library(grid)

folder_path <- "C:\\Users\\Kruger_F1\\Pictures\\tmp\\"
files <- list.files(folder_path)

filename <- "ST04-017"
file <- paste0(filename, ".png")

img <- image_read(paste0(folder_path, file))

img_info <- image_info(img)
width <- img_info$width
height <- img_info$height

# #ABILIY 1 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 538
# x_radius <- 522
# y_radius <- 45

#ABILIY 2 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 548
# x_radius <- 522
# y_radius <- 65

# #ABILIY 3 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 560
# x_radius <- 522
# y_radius <- 90

#ABILIY 4 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 577
# x_radius <- 522
# y_radius <- 125

#ABILIY 5 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 590
# x_radius <- 522
# y_radius <- 150

# #ABILIY 6 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 600
# x_radius <- 522
# y_radius <- 180

# #ABILIY 1 line top
# x_center <- 300# X-coordinate of the circle center
# y_center <- 520
# x_radius <- 522
# y_radius <- 45
  
# #ABILIY 2 line top
# x_center <- 300# X-coordinate of the circle center
# y_center <- 532
# x_radius <- 522
# y_radius <- 65

#ABILIY 1 3 linestop
# x_center <- 300# X-coordinate of the circle center
# y_center <- 545
# x_radius <- 522
# y_radius <- 90

#ABILIY 1 4 linestop
# x_center <- 300# X-coordinate of the circle center
# y_center <- 558
# x_radius <- 522
# y_radius <- 120

# #ABILIY 1 6 linestop
# x_center <- 300# X-coordinate of the circle center
# y_center <- 590
# x_radius <- 522
# y_radius <- 180

#TRIGGER 1 1 linestop
# x_center <- 300# X-coordinate of the circle center
# y_center <- 675
# x_radius <- 522
# y_radius <- 45

# #TRIGGER 1 2 linestop
# x_center <- 300# X-coordinate of the circle center
# y_center <- 660
# x_radius <- 522
# y_radius <- 65

# #SECOND ABILITY 2 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 608
# x_radius <- 522
# y_radius <- 65

# #SECOND ABILITY 3 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 619
# x_radius <- 522
# y_radius <- 90

#SECOND ABILITY 1 line top transparent
# x_center <- 300# X-coordinate of the circle center
# y_center <- 592
# x_radius <- 522
# y_radius <- 35

mask <- image_draw(image_blank(width = width, height = height, color = "none"))
polygon(x = c(x_center - x_radius/2, x_center + x_radius/2, x_center + x_radius/2, x_center - x_radius/2), 
        y = c(y_center + y_radius/2, y_center + y_radius/2, y_center - y_radius/2, y_center - y_radius/2), 
        col = "white", border = "white")
dev.off()
temp_mask_path <- tempfile(fileext = ".png")
image_write(mask, path = temp_mask_path, format = "png")
mask <- image_read(temp_mask_path)
img_cropped <- image_composite(img, mask, operator = "copyopacity")

geom <- paste0(x_radius, "x", y_radius, "+", x_center-x_radius/2, "+", y_center-y_radius/2)
resized_img <- image_crop(img_cropped, geometry = geom)
print(resized_img)
image_write(resized_img, paste0("C:/Users/Kruger_F1/Documents/temp.png"))




img_cropped <- image_read(paste0("C:/Users/Kruger_F1/Documents/temp.png"))
print(img_cropped)
img_info <- image_info(img_cropped)
width <- img_info$width
height <- img_info$height
mask <- image_draw(image_blank(width = width, height = height, color = "none"))
grid::grid.roundrect(x = 0.5, y = 0.5, width = 1, height = 1, r = unit(8, "pt"), gp = grid::gpar(fill = "white", col = NA))
dev.off()
img_rounded <- image_composite(img_cropped, mask, operator = "copyopacity")
print(img_rounded)

image_write(img_rounded, paste0("C:/Users/Kruger_F1/Documents/", paste0(filename, "-ABILITY1.png")))
# image_write(img_rounded, paste0("C:/Users/Kruger_F1/Documents/", paste0(filename, "-TRIGGER.png")))
