import csv
import json
import re


def is_number(s):
    return re.search(r'^[-+]?\d+(\.\d+)?$', str(s)) is not None
    
not_interesting = ["World", "Upper middle income", "Sub-Saharan Africa (IDA & IBRD countries)", "South Asia (IDA & IBRD)",
                   "Middle East & North Africa (IDA & IBRD countries)","Latin America & the Caribbean (IDA & IBRD countries)",
                   "Europe & Central Asia (IDA & IBRD countries)","East Asia & Pacific (IDA & IBRD countries)",
                   "Small states","Sub-Saharan Africa","Sub-Saharan Africa (excluding high income)",
                   "Post-demographic dividend","Pacific island small states","Pre-demographic dividend",
                   "West Bank and Gaza","Other small states","OECD members","North America",
                   "Middle East & North Africa (excluding high income)","Middle income","Middle East & North Africa",
                   "Late-demographic dividend","Low & middle income","Lower middle income","Low income",
                   "Least developed countries: UN classification","Latin America & Caribbean",
                   "Latin America & Caribbean (excluding high income)","IDA only","IDA blend",
                   "IDA total","IDA & IBRD total","IBRD only","Heavily indebted poor countries (HIPC)","High income",
                   "Fragile and conflict affected situations", "European Union","Euro area","Europe & Central Asia",
                   "Europe & Central Asia (excluding high income)","East Asia & Pacific", "Early-demographic dividend",
                   "East Asia & Pacific (excluding high income)", "Caribbean small states", "Central Europe and the Baltics",
                   "Arab World", "Africa Western and Central","Africa Eastern and Southern"]
gni_per_capita = {}
with open("static/data/API_NY.GNP.PCAP.PP.CD_DS2_en_csv_v2_5358652.csv", "r") as f:
    start_flag = True
    column_names = []
    reader = csv.reader(f)

    for row in reader:
        if row == []:
            continue

        if row[0] != "Country Name":
            if start_flag:
                continue

            else:
                
                # extract income data
                # Move backwards thorugh the row to find the latest gni number
                for i in range(len(row) - 1, -1, -1):
                    if row[i] != "" and is_number(row[i]):
                        gni_per_capita[row[1]] = {"name": row[0], "income": row[i], "year": column_names[i]}
                        break

        #print(row[0])
        if row[0] == "Country Name":
            start_flag = False
            column_names = row

gni_per_capita["metadata"] = {"Indicator Code":"NY.GNP.PCAP.PP.CD",
                              "Indicator Name":"GNI per capita, PPP (current international $)",
                              "Source Note":"This indicator provides per capita values for gross national income (GNI. Formerly GNP) expressed in current international dollars converted by purchasing power parity (PPP) conversion factor.  GNI is the sum of value added by all resident producers plus any product taxes (less subsidies) not included in the valuation of output plus net receipts of primary income (compensation of employees and property income) from abroad. PPP conversion factor is a spatial price deflator and currency converter that eliminates the effects of the differences in price levels between countries.",
                              "Source": "World Bank", 
                              "URL": "https://data.worldbank.org/indicator/NY.GNP.PCAP.PP.CD", 
                              "Last Updated Date":"2023-03-01"
}

with open ("static/data/gni_per_capita.json", "w") as o:
     o.write(json.dumps(gni_per_capita))