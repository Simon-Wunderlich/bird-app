import json
import os
files = os.listdir("user_data")
for fileName in files:
    print(fileName)
    with open("user_data/" + fileName, "r") as f:
        data = json.load(f)
        foundBirds = []
        points = 0
        for x in range(len(data["birds"])):
            bird= data["birds"][x]
            if bird["isRare"]:
                points += 5
            elif bird["name"] not in foundBirds:
                points += 2
            else:
                points += 1
            if bird["name"] not in foundBirds:
                bird["isNew"] = True
            else:
                bird["isNew"] = False
            foundBirds.append(bird["name"])
            data["points"] = points

    with open("user_data/" + fileName, "w") as f:
        json.dump(data, f, indent = 4)
    print(json.dumps(data, indent = 4))
