let response = await fetch("static/data/ppp_conversion_alpha2.json");
const PPP_CONVERSION = await response.json();
response = await fetch("static/data/exchange_rates.json");
const CURRENCY_CONVERSION = await response.json();
response = await fetch("static/data/income_centiles.json");
const PERCENTILES = await response.json();

const a2Toa3Lookup = {"AF": "AFG", "AL": "ALB", "DZ": "DZA", "AO": "AGO", "AG": "ATG", "AR": "ARG", "AM": "ARM", "AW": "ABW", "AU": "AUS", "AT": "AUT", "AZ": "AZE", "BS": "BHS", "BH": "BHR", "BD": "BGD", "BB": "BRB", "BY": "BLR", "BE": "BEL", "BZ": "BLZ", "BJ": "BEN", "BM": "BMU", "BT": "BTN", "BO": "BOL", "BA": "BIH", "BW": "BWA", "BR": "BRA", "BN": "BRN", "BG": "BGR", "BF": "BFA", "BI": "BDI", "KH": "KHM", "CM": "CMR", "CA": "CAN", "CV": "CPV", "KY": "CYM", "CF": "CAF", "TD": "TCD", "CL": "CHL", "CN": "CHN", "CO": "COL", "KM": "COM", "CG": "COG", "CD": "COD", "CR": "CRI", "CI": "CIV", "HR": "HRV", "CU": "CUB", "CY": "CYP", "CZ": "CZE", "DK": "DNK", "DJ": "DJI", "DM": "DMA", "DO": "DOM", "EC": "ECU", "EG": "EGY", "SV": "SLV", "GQ": "GNQ", "ER": "ERI", "EE": "EST", "ET": "ETH", "FJ": "FJI", "FI": "FIN", "FR": "FRA", "GA": "GAB", "GM": "GMB", "GE": "GEO", "DE": "DEU", "GH": "GHA", "GR": "GRC", "GD": "GRD", "GT": "GTM", "GN": "GIN", "GW": "GNB", "GY": "GUY", "HT": "HTI", "HN": "HND", "HK": "HKG", "HU": "HUN", "IS": "ISL", "IN": "IND", "ID": "IDN", "IR": "IRN", "IQ": "IRQ", "IE": "IRL", "IL": "ISR", "IT": "ITA", "JM": "JAM", "JP": "JPN", "JO": "JOR", "KZ": "KAZ", "KE": "KEN", "KI": "KIR", "KR": "KOR", "KW": "KWT", "KG": "KGZ", "LA": "LAO", "LV": "LVA", "LB": "LBN", "LS": "LSO", "LR": "LBR", "LY": "LBY", "LT": "LTU", "LU": "LUX", "MO": "MAC", "MG": "MDG", "MW": "MWI", "MY": "MYS", "MV": "MDV", "ML": "MLI", "MT": "MLT", "MH": "MHL", "MR": "MRT", "MU": "MUS", "MX": "MEX", "FM": "FSM", "MD": "MDA", "MN": "MNG", "MA": "MAR", "MZ": "MOZ", "MM": "MMR", "NA": "NAM", "NR": "NRU", "NP": "NPL", "NL": "NLD", "NZ": "NZL", "NI": "NIC", "NE": "NER", "NG": "NGA", "MK": "MKD", "NO": "NOR", "OM": "OMN", "PK": "PAK", "PW": "PLW", "PS": "PSE", "PA": "PAN", "PG": "PNG", "PY": "PRY", "PE": "PER", "PH": "PHL", "PL": "POL", "PT": "PRT", "PR": "PRI", "QA": "QAT", "RO": "ROU", "RU": "RUS", "RW": "RWA", "KN": "KNA", "LC": "LCA", "VC": "VCT", "WS": "WSM", "SM": "SMR", "ST": "STP", "SA": "SAU", "SN": "SEN", "SC": "SYC", "SL": "SLE", "SG": "SGP", "SK": "SVK", "SI": "SVN", "SB": "SLB", "SO": "SOM", "ZA": "ZAF", "ES": "ESP", "LK": "LKA", "SD": "SDN", "SR": "SUR", "SZ": "SWZ", "SE": "SWE", "CH": "CHE", "SY": "SYR", "TJ": "TJK", "TZ": "TZA", "TH": "THA", "TL": "TLS", "TG": "TGO", "TO": "TON", "TT": "TTO", "TN": "TUN", "TR": "TUR", "TM": "TKM", "TC": "TCA", "TV": "TUV", "UG": "UGA", "UA": "UKR", "AE": "ARE", "GB": "GBR", "US": "USA", "UY": "URY", "UZ": "UZB", "VU": "VUT", "VE": "VEN", "VN": "VNM", "VG": "VGB", "YE": "YEM", "ZM": "ZMB", "ZW": "ZWE", "CW": "CUW", "ME": "MNE", "RS": "SRB", "SX": "SXM", "SS": "SSD", "XK": "XKX"}

// calculate how to adjust for household size using OECD equivalised income
// the weightings are for first adult, subsequent adults and children respectively:
//   1, 0.7, 0.5
function getHouseholdEquivalizationFactor(adults, children) {
    let factor = 0;
    if (adults === 1) {
        factor = 1
    } else {
        factor = 0.7 * adults + 0.3
    }
    factor += 0.5 * children
  return factor
}

// PPP conversion - returns an amount in I$
export function convertIncomeToPPP(income) {
    const countryAlpha2Code = document.getElementById("select-country").value
    // TODO check if currency found and if currency in PPP_CONVERSION
    const incomeInUSD = income / CURRENCY_CONVERSION[a2Toa3Lookup[countryAlpha2Code]].rate
    return incomeInUSD / PPP_CONVERSION[countryAlpha2Code].factor
}

// equivalises an income to a particular household composition
export function getEquivalizeIncome(income) {
    return income / getHouseholdEquivalizationFactor(getNumberOfAdults(), getNumberOfChildren())
}

export function getMedianIncome() {
    let i = 1, len = PERCENTILES.length;
    let closest = Infinity, closestIndex = -1;
    let distance = 0;
    while (i < len) {
        distance = Math.abs(50 - PERCENTILES[i].percentage);
        if (distance < closest) {
            closest = distance;
            closestIndex = i;
            i++;
        }
        else {
            break;
        }
    }
    const medianIncome = PERCENTILES[closestIndex];
	return medianIncome.international_dollars;
}

export function getInputIncome() {
    const incomeInput = document.getElementById("income");
    return incomeInput.value;
}

export function getNumberOfAdults(){
    const adultInput = document.getElementById("adults");
    return adultInput.value;
}

export function getNumberOfChildren(){
    const childrenInput = document.getElementById("children");
    return childrenInput.value;
}

export function getDonationPercentage() {
    const donationPercent = parseInt(document.getElementById("value-bubble").innerText.slice(0, -1));
    return donationPercent;
}

export function getAfterDonationIncome() {
    return getEquivalizeIncome(convertIncomeToPPP(getInputIncome())) * (100 - getDonationPercentage()) / 100;
}

export function getPreDonationIncome() {
    return getEquivalizeIncome(convertIncomeToPPP(getInputIncome()));
}

export function getDonatedAmount() {
    return getPreDonationIncome() * (getDonationPercentage() / 100);
}

// Generate data for the poorer and richer groups
export function generateData(group, count, circle_size) {
d3.packSiblings(d3.range(count).map(() => ({ r: circle_size, group })));}