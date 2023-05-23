// export const MEDIAN_INCOME = interpolateIncomeAmountByCentile(50)

const response = await fetch("static/data/ppp_conversion_alpha2.json");
const PPP_CONVERSION = await response.json();


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
export function convertIncomeToPPP(income, countryCode) {
    // TODO check if currency found and if currency in PPP_CONVERSION
    return income / PPP_CONVERSION[countryCode].factor

}

// equivalises an income to a particular household composition
export function getEquivalizeIncome(income, adults, children) {
    return income / getHouseholdEquivalizationFactor(adults, children)
}
