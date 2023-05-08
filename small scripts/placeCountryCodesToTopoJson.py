import json 
from fuzzywuzzy import fuzz

gni_per_capita = {}
with open("static/data/gni_per_capita.json", "r") as f:
    gni_per_capita = json.load(f)

countries = {}
with open("static/data/countries-50m.json", "r") as f:
    countries = json.load(f)

countries_gwwc = {}
with open("static/data/countries.json", "r") as f:
    countries_gwwc = json.load(f)

manual_matches = {"Syria":"SYR", "Russia":"RUS", "W. Sahara":"ESH", "Laos":"LAO", "Vatican":"VAT", "N. Mariana Is.":"MNP",
                  "U.S. Virgin Is.":"VIR", "Br. Indian Ocean Ter.":"IOT", "Pitcairn Is.":"PCN","Falkland Is.":"FLK",
                  "British Virgin Is.":"VGB","St. Vin. and Gren.":"VCT","Cook Is.":"COK","Palestine":"PSE", "St. Pierre and Miquelon":"SPM",
                  "Wallis and Futuna Is.":"WLF","St. Helena":"SHN", "St-Martin":"MAF", "St-Barth\u00e9lemy":"BLM", 
                  "Fr. Polynesia":"PVF", "Fr. S. Antarctic Lands":"ATF", "\u00c5land":"ALA", "Faeroe Is.":"FRO",
                  "Heard I. and McDonald Is.":"HMD", "Svalbard":"SJM", "Ashmore and Cartier Is.":"AUS",
                  "S. Geo. and the Is.":"SGS", "Indian Ocean Ter.":"IOT"}

print(len(countries["objects"]["countries"]["geometries"]), "?= ", len(gni_per_capita.items()))
for contry in countries["objects"]["countries"]["geometries"]:
    country_name = contry["properties"]["name"]
    
    if country_name in manual_matches:
        contry["properties"]["code"] = manual_matches[country_name]
        continue

    best_match = None
    for code, properties in gni_per_capita.items():
        if code == "metadata":
            continue
        name = properties["name"]

        if name == country_name:
            best_match = name
            contry["properties"]["code"] = code
            break

        similarity = fuzz.token_set_ratio(country_name, name)
        if similarity >= 80:

            inp = input(f"Is {name} the same as {country_name}? (y/n): ")
            if inp == "y":
                best_match = name
                contry["properties"]["name"] = name
                contry["properties"]["code"] = code
                break


    if best_match == None:
        for gwwc_country in countries_gwwc:
            if country_name == gwwc_country["name"]:
                best_match = gwwc_country["name"]
                contry["properties"]["code"] = gwwc_country["code"]
                break
    
    if best_match == None:
        print(f"Could not find a match for {country_name}")
        contry["properties"]["code"] = "None"


with open("static/data/updated-countries-50m.json", "w") as f:
    json.dump(countries, f)