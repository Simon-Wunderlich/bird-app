import os
from PIL import Image


files = os.listdir("./images")
data = []
for fileName in files:
    try:
        img = Image.open("./images/" + fileName)
        w, h = img.size
        new_w = 200
        new_h = int(h * (new_w / w))
        out = img.resize((new_w, new_h), Image.BICUBIC)
        if img.info.get("exif") is not None: 
            out.save("images/thumbnails/" + fileName, exif=img.info.get("exif"))
        else:
            out.save("images/thumbnails/" + fileName)
    except:
        print(fileName)
