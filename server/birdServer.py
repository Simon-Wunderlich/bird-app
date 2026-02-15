import json
import urllib.request
import re
import requests
import os.path
from datetime import datetime

from asgiref.wsgi import WsgiToAsgi
from flask import Flask, jsonify, request

#TO START SERVER, RUN:
#python3 -m hypercorn --config python:config server:bird_app
app = Flask(__name__)


#requires
#uid
# lat, long
# bird Name
# bird code
# image
#region

@app.route('/', methods=['OPTIONS'])
def options():
    # Custom headers for CORS preflight
    res = Response()
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Methods'] = 'POST'
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return res

@app.route('/<file_name>', methods=['POST'])
def submitImage(file_name):
    imgData = json.loads(request.data)
    data = ""
    try:
        with open("images/" + file_name + ".txt", "r") as f:
            data = f.read()
    except:
        pass
    data += imgData["img"]
    with open("images/" + file_name + ".txt", "w") as f:
        f.write(data)

    response = jsonify("success")
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route('/', methods=['POST'])
def submitBird():
    birdInfo = json.loads(request.data)
    uid = birdInfo["uid"]

    
    data = {
        "birds" : [],
        "username" : "New User",
        "birdCounts" : {},
        "locations" : {},
        "points" : 0
    }

    try:
        with open(f"user_data/{uid}.json", "r") as f:
            data = json.load(f)
    except:
        pass

    area = str(round(birdInfo['lat'],3)) + "," + str(round(birdInfo['long'],3))
    if area in data["locations"]:
        if birdInfo["bird"][1] in data["locations"][area]:
            return {"message" : f"Already found a {birdInfo['bird'][1]} here" }
        else:
            data["locations"][area].append(birdInfo["bird"][1])
    else:
        data["locations"][area] = [ birdInfo["bird"][1] ]



    # Bird count
    if birdInfo["bird"][1] not in data["birdCounts"]:
        data["birdCounts"][birdInfo["bird"][1]] = 0
    data["birdCounts"][birdInfo["bird"][1]] += 1

    # Rarity (needs bird code)
    headers = {"X-eBirdApiToken" : "jfekjedvescr"}
    r = requests.get(f"https://api.ebird.org/v2/product/barchart?spp={birdInfo['bird'][0]}&regionCodes={birdInfo['region']}", headers = headers)
    freqs =r.json()["dataRows"][0]["values"] 

    yrPercent = float(datetime.now().strftime('%-j'))/365
    index = round((len(freqs) - 1) * yrPercent)
    
    rarity = freqs[index]
    isRare = rarity < 0.1
    data["points"] += 5 if isRare else 1
    
    with open("images/" + uid + ".txt", "r") as f:
        birdImage = f.read()
    pattern = "data:image/(.+?);base64"
    ftype = re.search(pattern, birdImage).group(1)
    response = urllib.request.urlopen(birdImage)
    fileName = f"/{uid}{birdInfo['bird'][0]}{area}.{ftype}"
    with open(f"../app/public{fileName}", "wb") as f:
        f.write(response.file.read())

    with open("images/" + uid + ".txt", "w") as f:
        f.write("")

    #Bird list
    data["birds"].append({
        "name" : birdInfo["bird"][1],
        "region" : birdInfo["regionName"],
        "isRare" : isRare,
        "image" : fileName
        })

    with open(f"user_data/{uid}.json", "w") as f:
        json.dump(data, f, indent = 4)

    return getFiles()

@app.route("/", methods=["GET"])
def getFiles():
    files = os.listdir("user_data")
    data = []
    for fileName in files:
        with open("user_data/" + fileName, "r") as f:
            file = json.load(f)
            data.append(file)
    response = jsonify(data)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response



if __name__ == "__main__":
    app.run(port = 8000, host='0.0.0.0')
