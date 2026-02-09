import json
import re
import requests
import os.path
from datetime import datetime

from asgiref.wsgi import WsgiToAsgi
from flask import Flask, jsonify

#TO START SERVER, RUN:
#python3 -m hypercorn --config python:config server:bird_app
app = Flask(__name__)

def getSessionID():
    global sessionID

    r = requests.get("https://ebird.org/home", allow_redirects=False)
    sessionID = r.headers["set-cookie"]
    pattern = "SESSIONID=(.+?);"
    sessionID = re.search(pattern, sessionID).group(1)
    print(sessionID)
    return sessionID

def getAuthUrl():

    headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': 'XSRF-TOKEN=5aa50542-1f00-468b-8bf8-f0b8f3ac283b'}
    # EXECUTION MAY EXPIRE, IF SO: SCRAPE FROM https://secure.birds.cornell.edu/cassso/login
    with open("data", "r") as f:
        data = f.read()
    url = "https://secure.birds.cornell.edu/cassso/login"
    r = requests.post(url, headers = headers, data = data[:-1], allow_redirects = False)
    return r.headers["location"]

def authenticate():
    getSessionID()
    authUrl = getAuthUrl()

    headers = {'Cookie' : '_9bf17=490a770f203a8168; EBIRD_SESSIONID=01F20108635AE32B7C1D357FA64E8E3C'}
    requests.get(authUrl, headers = headers, allow_redirects = False)

@app.route('/all/<req_type>')
def getAllUsers(req_type = "SLOW"):
    files = os.listdir("user_data")
    data = []
    for fileName in files:
        uId = fileName.split(".")[0]
        if req_type == "QUICK":
            with open("user_data/" + fileName, "r") as f:
                file = json.load(f)
                data.append(file)
        else:
            data.append(getContent(uId, internal = True))
    response = jsonify(data)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/<user_id>')
def getContent(user_id, recursions = 0, internal = False):
    if recursions >= 3:
        response = jsonify(message = "Failed 3 times in a row")
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    headers = { 'Cookie' : f'_9bf17=490a770f203a8168; EBIRD_SESSIONID={sessionID}; EBIRD_REGION_CONTEXT=%7B%22regionCode%22%3A%22AU%22%2C%22regionName%22%3A%22Australia%22%7D'}

    r = requests.get(f"https://ebird.org/prof/lists?r=world&username={user_id}", headers = headers, allow_redirects = False)
    if (r.status_code == 500):
        response = jsonify(message = "Invalid user id")
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    if (r.json() == []):
        authenticate()
        return getContent(user_id, recursions + 1)

    if internal:
        return parseResults(r.json(), user_id)

    response = jsonify(parseResults(r.json(), user_id))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def parseResults(rawJson, user_id):
    data = {
        "checklists" : {},
        "birds" : [],
        "username" : rawJson[0]["userDisplayName"],
        "birdCounts" : {},
        "locations" : {},
        "points" : 0
    }
    try:
        with open(f"user_data/{user_id}.json", "r") as f:
            data = json.load(f)
    except:
        pass
    for x in rawJson:
        if x["subId"] not in data["checklists"] or x["numSpecies"] > data["checklists"][x["subId"]]:
           if "subnational2Code" in x["loc"]:
               regCode = x["loc"]["subnational2Code"]
           else:
               regCode = x["loc"]["subnational1Code"]
           checklist = parseChecklist(x["subId"], regCode)
           print(checklist)
           for birdArr in checklist:
               bird, isRare, image = birdArr
               isValid = True
               area = f"{round(x['loc']['lat'],3)},{round(x['loc']['lng'],3)}"
               if (area in data["locations"]):
                   if bird in data["locations"][area]:
                       continue
                   else:
                       data["locations"][area].append(bird)
               else:
                   data["locations"][area] = [ bird ]

               if bird not in data["birdCounts"]:
                   data["birdCounts"][bird] = 0

               data["birdCounts"][bird] += 1

               if isRare:
                   data["points"] += 5
               else:
                   data["points"] += 1
    
               data["birds"].append({
                       "bird" : bird, 
                       "date" : x["obsDt"],
                       "location" : x["loc"]["hierarchicalName"], 
                       "coordinates" : f"{x['loc']['lat']},{x['loc']['lng']}", 
                       "isRare" : isRare,
                       "image" : image
                       })
               if x["subId"] in data["checklists"]:
                    data["checklists"][x["subId"]] += 1
               else:
                    data["checklists"][x["subId"]] = 1
                    
    with open(f"user_data/{user_id}.json", "w") as f:
        json.dump(data, f, indent = 4)
    return data

def parseChecklist(cID, regCode):
    r = requests.get(f"https://ebird.org/merlin/checklist/{cID}")

    page = r.text

    pattern = "<span class=\"Heading-main\"  >(.+?)</span>"
    species = list(set(re.findall(pattern, page)))

    birds = {}
    with open("birds.json", "r") as f:
        birds = json.load(f)
    
    pattern = "/species/(.+?)\""
    codes = list(set(re.findall(pattern, page)))

    birdList = []

    for i, code in enumerate(codes):

#         pattern = f""""^(.+?)alt="Laughing Kookaburra"
# ^(.+?)data-image-lazy
# ^(.+?)data-src="https://cdn.download.ams.birds.cornell.edu/api/v2/asset/(.+?)/160"""
        pattern = f"""data-media-id="(.+?)"
																data-media-obsid="(.+?)"
																data-media-speciescode="{code}"
""" 
        reg = re.search(pattern, page)
        if (reg):
            image = "https://cdn.download.ams.birds.cornell.edu/api/v2/asset/" + reg.group(1) + "/480"
            print(image)
        else:
            continue

        if (code in birds and regCode in birds[code]):
            freqs = birds[code][regCode]
        else:
            headers = {"X-eBirdApiToken" : "jfekjedvescr"}
            r = requests.get(f"https://api.ebird.org/v2/product/barchart?spp={code}&regionCodes={regCode}", headers = headers)
            if code not in birds:
                birds[code] = {regCode : []}
            birds[code][regCode] = freqs
            with open("birds.json", "w") as f:
                json.dump(birds, f, indent = 4)

        yrPercent = float(datetime.now().strftime('%-j'))/365
        index = round((len(freqs) - 1) * yrPercent)
        
        rarity = freqs[index]
        birdList.append([species[i], rarity < 0.1, image])

    # elif code not in birds:
    #     r = requests.get("https://ebird.org/species/" + code)
    #     pattern = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/(.+?)/"
    #     image = re.search(pattern, r.text).group(1)
    #     image = f"https://cdn.download.ams.birds.cornell.edu/api/v1/asset/{image}/480"
    #     birds.update({code : {"image" : image, regCode : freqs}})
    # else:
    #     image = birds[code]["image"]


    return birdList

authenticate()
bird_app = WsgiToAsgi(app)
