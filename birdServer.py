import json
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
@app.route('/', methods=['POST'])
def submitBird():
    birdInfo = request.get_json()

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

    area = round(birdInfo['lat'],3) + "," round(birdInfo['long'],3)
    if area in data["locations"]:
        if birdInfo["bird"] in data["locations"]["area"]:
            return f"Already found a {birdInfo['bird']} here", 400
        else:
            data["locations"]["area"].append(birdInfo["bird"])
    else:
        data["locations"]["area"] = [ birdInfo["bird"] ]



    # Bird count
    if birdInfo["bird"][0] not in data["birdCounts"]:
        data["birdCounts"][birdInfo["bird"][0]] = 0
    data["birdCounts"][birdInfo["bird"][0]]

    # Rarity (needs bird code)
    headers = {"X-eBirdApiToken" : "jfekjedvescr"}
    r = requests.get(f"https://api.ebird.org/v2/product/barchart?spp={birdInfo['bird'][1]}&regionCodes={birdInfo['region']}", headers = headers)
    freqs =r.json()["dataRows"][0]["values"] 

    yrPercent = float(datetime.now().strftime('%-j'))/365
    index = round((len(freqs) - 1) * yrPercent)
    
    rarity = freqs[index]
    isRare = rarity < 0.1
    data["points"] += 5 if isRare else 1

    #Bird list
    data["birds"].append({
        "name" : birdInfo["bird"][0],
        "region" : birdInfo["region"],
        "isRare" : isRare,
        "image" : birdInfo["image"]
        })
