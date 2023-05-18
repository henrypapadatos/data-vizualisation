import json
# countries = json.load(open("static/data/countries.json", "r"))

# # https://datahub.io/core/country-codes#data
# supplementDataset = json.load(open("country-codes.json", "r"))

# for country in countries:
#     found = False
#     for supplement in supplementDataset:
#         if country["code"] == supplement["ISO3166-1-Alpha-3"]:
#             found = True
#             country["alpha2Code"] = supplement["ISO3166-1-Alpha-2"]
#             break
#     if not found:
#         print("NOT FOUND: " + country["name"])
# outCountries = open("static/data/enrichedCountries.json", "w")
# outCountries.write(json.dumps(countries))
# print("DONE")

countries = json.load(open("/home/rembrandt/Documents/Magister/Semester_2/Data visualization/project-2023-graphing-what-we-can/static/data/countries.json", "r"))
supplements = json.load(open("/home/rembrandt/Downloads/custom.geo.json", "r"))
for country in countries:
    found = False
    for supplement in supplements['features']:
        if country["code"] == supplement["properties"]["iso_a3"]:
            found = True
            shorter_name = supplement["properties"]["name"]
            if  len(supplement["properties"]["name_sort"]) < len(shorter_name):
                shorter_name = supplement["properties"]["name_sort"]
            country["name_sort"] = shorter_name
            # if country["name"] == country["name_sort"]:
            #     print("SAME: " + country["name"])
            break
    if not found:
        print("NOT FOUND: " + country["name"], country["code"])
print("\n\n")
for supplement in supplements['features']:
    found = False
    for country in countries:
        if country["code"] == supplement["properties"]["iso_a3"]:
            found = True
            break
    if not found:
        print("NOT FOUND: " + supplement["properties"]["name"], supplement["properties"]["iso_a3"])
#print(countries)