import json
countries = json.load(open("static/data/countries.json", "r"))

# https://datahub.io/core/country-codes#data
supplementDataset = json.load(open("country-codes.json", "r"))

for country in countries:
    found = False
    for supplement in supplementDataset:
        if country["code"] == supplement["ISO3166-1-Alpha-3"]:
            found = True
            country["alpha2Code"] = supplement["ISO3166-1-Alpha-2"]
            break
    if not found:
        print("NOT FOUND: " + country["name"])
outCountries = open("static/data/enrichedCountries.json", "w")
outCountries.write(json.dumps(countries))
print("DONE")