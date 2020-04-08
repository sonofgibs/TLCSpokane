/* 

Filename: HandleData.jsw 

Author: Gonzaga University CPSC Team 10 2019-2020 

Description: This file handles all storage of data 
				recieved from the Avista database or
				Zillow API.

*/

import wixData from "wix-data";
import { get_zillow_data } from "backend/API";

/*
Description: Given a raw address entered by the user and a zipcode
             selected by the user, perform the necessary queries,
			 API calls, and calculations to return a data object that
			 contains all of the relevant information for the
			 property address. The async/ await allows for asynchrous 
			 functions to finish before being displayed.

Parameters:
	- rawAddress: the address entered by the user
	- zipcode: the zipcode selected by the user

Returns: 
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address
*/
export async function handle_search_results_data(rawAddress, zipcode) {
  // For our purposes, data is essentially a container of
  // relevant properties/attributes/variables for a particular property
  // Note: -1 represents an error case (all properties involving data
  //       calls are initialized to -1, as they may not be found)
  var searchResultsData = {
    cookedAddress: rawAddress,
    zipcode: zipcode,
    high: -1,
    low: -1,
    avg: -1,
    zestimate: -1,
    sqFt: -1,
    avgUtilityCostPerSqFt: -1,
    totalCost: -1,
  };

  searchResultsData = cap_and_remove_periods(searchResultsData);

  searchResultsData = await handle_avista_data(searchResultsData);

  searchResultsData = await handle_zillow_data(searchResultsData);

  searchResultsData = calculate_total_cost(searchResultsData);

  return searchResultsData;
}

/*
Description: This takes the address that is passed in by the user,
			 capitalizes, and removes periods from the address.

Parameter(s):
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address

Return(s):
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address with an updated address
 */
function cap_and_remove_periods(searchResultsData) {
  // Capitalize all letters
  let address = searchResultsData.cookedAddress.toUpperCase();

  // Handle abbreviation periods
  address = address.replace(/\./g, "");

  //Handle multiple spaces
  address = address.replace(/  +/g, " ");

  address = address.trim();

  searchResultsData.cookedAddress = address;
  return searchResultsData;
}

/*
Description: This function takes in a data object and potentially updates
			 its address and high/low/average values.
			 An updated data object is returned. The async/ await
			 allows for asynchrous functions to finish before being displayed.

Parameter(s):
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address

Return(s): 
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address with a possibly updated high/low/average and address value
 */
async function handle_avista_data(searchResultsData) {
  // Query Avista database
  await wixData
    .query("AvistaData")
    .eq("street", searchResultsData.cookedAddress)
    .find()
    .then(async (results) => {
      // If the results cannot be found via the initial conversion
      if (results.items.length === 0) {
        // Perform regex operations
        searchResultsData.cookedAddress = cook_address_regex(
          searchResultsData.cookedAddress
        );
      }

      // Re-query Avista database
      await wixData
        .query("AvistaData")
        .eq("street", searchResultsData.cookedAddress)
        .find()
        .then((results2) => {
          // Makes sure there are items within the address
          if (results2.items.length > 0) {
            // Get high value
            if (results2.items[0].highBillAmount.length !== 0) {
              searchResultsData.high = results2.items[0].highBillAmount;
            }

            // Get low value
            if (results2.items[0].lowBillAmount.length !== 0) {
              searchResultsData.low = results2.items[0].lowBillAmount;
            }

            // Get average value
            if (results2.items[0].aveBillAmount.length !== 0) {
              searchResultsData.avg = results2.items[0].aveBillAmount;
            }
          }
        });
    });

  return searchResultsData;
}

/*
Description: This takes the address that is passed in by the user
			 and cooks the address to match the format of that in the database by 
			 using regular expressions to shorten the string and replace words to 
			 their abbreviations. Accounts for both one or multiple cardinal directions,
			 as well as ordinal numbers.

Parameter(s):
	- rawAddress:The address to be cooked, inputed by user

Return(s): 
	- cookedAddress: address in the format of the database
 */
function cook_address_regex(rawAddress) {
  let cookedAddress = rawAddress;
  cookedAddress = cook_cardinals_and_miscellaneous(cookedAddress);
  cookedAddress = cook_ordinals(cookedAddress);
  return cookedAddress;
}

/*
Description: This takes the address that is passed in by the user 
			 and cooks cardinal directions to match the format of that in the database

Parameter(s):
	- cookedAddress: The address to be cooked, inputted by the user

Return(s):
	- cookedAddress: addres cooked into the format of the database
*/
function cook_cardinals_and_miscellaneous(cookedAddress) {
  //List containing all cardinal directions
  let cardinal = [" N ", " S ", " E ", " W ", "NORTH", "SOUTH", "EAST", "WEST"];

  let cardinalCounter = 0;

  for (
    let i = 0;
    i < cardinal.length;
    i++ // searches for each direction listed in "cardinal" array
  ) {
    // if a cardinal direction is found within the entered address string, increment the cardinal count
    if (cookedAddress.includes(cardinal[i])) {
      cardinalCounter = cardinalCounter + 1;
    }
  }

  // if address contains more than one cardinal direction
  if (cardinalCounter > 1) {
    //If there is one cardinal direction before the next
    cookedAddress = cookedAddress.replace(/NORTH EAST/g, "N EAST");
    cookedAddress = cookedAddress.replace(/SOUTH EAST/g, "S EAST");
    cookedAddress = cookedAddress.replace(/NORTH WEST/g, "N WEST");
    cookedAddress = cookedAddress.replace(/SOUTH WEST/g, "S WEST");

    cookedAddress = cookedAddress.replace(/EAST NORTH/g, "E NORTH");
    cookedAddress = cookedAddress.replace(/EAST SOUTH/g, "E SOUTH");
    cookedAddress = cookedAddress.replace(/WEST NORTH/g, "W NORTH");
    cookedAddress = cookedAddress.replace(/WEST SOUTH/g, "W SOUTH");

    //ODD CASES
    cookedAddress = cookedAddress.replace(/NORTH NORTH/g, "N NORTH");
    cookedAddress = cookedAddress.replace(/NORTH SOUTH/g, "N SOUTH");
    cookedAddress = cookedAddress.replace(/SOUTH NORTH/g, "S NORTH");
    cookedAddress = cookedAddress.replace(/SOUTH SOUTH/g, "S SOUTH");
    cookedAddress = cookedAddress.replace(/EAST EAST/g, "E EAST");
    cookedAddress = cookedAddress.replace(/EAST WEST/g, "E WEST");
    cookedAddress = cookedAddress.replace(/WEST WEST/g, "W WEST");
    cookedAddress = cookedAddress.replace(/WEST EAST/g, "W EAST");
  }

  // if address contains 1 or 0 cardinal directions
  // Note: an address with 0 directions will make 0 replacements
  else {
    // Handle cardinal direction abbreviations
    cookedAddress = cookedAddress.replace(/EAST/g, "E");
    cookedAddress = cookedAddress.replace(/WEST/g, "W");
    cookedAddress = cookedAddress.replace(/NORTH/g, "N");
    cookedAddress = cookedAddress.replace(/SOUTH/g, "S");
    cookedAddress = cookedAddress.replace(/NORTHEAST/g, "NE");
    cookedAddress = cookedAddress.replace(/SOUTHEAST/g, "SE");
    cookedAddress = cookedAddress.replace(/NORTHWEST/g, "NW");
    cookedAddress = cookedAddress.replace(/SOUTHWEST/g, "SW");
  }

  // Handle miscellanous abbreviations
  cookedAddress = cookedAddress.replace(/STREET/g, "ST");
  cookedAddress = cookedAddress.replace(/AVENUE/g, "AVE");
  cookedAddress = cookedAddress.replace(/BUILDING/g, "BLDG");
  cookedAddress = cookedAddress.replace(/APARTMENT/g, "APT");
  cookedAddress = cookedAddress.replace(/FLOOR/g, "FL");
  cookedAddress = cookedAddress.replace(/BOULEVARD/g, "BLVD"); //Added boulevard GG- 2/5/20
  cookedAddress = cookedAddress.replace(/NUMBER/g, "#"); //Added number GG- 2/19/20
  cookedAddress = cookedAddress.replace(/UPPER/g, "UPPR"); //Added upper GG - 2/19/20
  cookedAddress = cookedAddress.replace(/LOWER/g, "LOWR"); //Added lower GG - 2/19/20

  return cookedAddress;
}

/*
Description: This takes the address that is passed in by the user 
			 and cooks ordinals to match the format of that in the database

Parameter(s):
	- cookedAddress: The address with cooked cardinal directions

Return(s):
	- cookedAddress: address cooked with cardinal directions and ordinals matching
	  the format of that in the database
*/
function cook_ordinals(cookedAddress) {
  //Ordinal Numbers

  //Get rid of ands and hyphens
  cookedAddress = cookedAddress.replace(/AND/g, "");
  cookedAddress = cookedAddress.replace(/-/g, "");

  //Special Cases 1- Beginning Numbers
  cookedAddress = cookedAddress.replace(/FIRST/g, "1ST");
  cookedAddress = cookedAddress.replace(/SECOND/g, "2ND");
  cookedAddress = cookedAddress.replace(/THIRD/g, "3RD");
  cookedAddress = cookedAddress.replace(/FOURTH/g, "4TH");
  cookedAddress = cookedAddress.replace(/FIFTH/g, "5TH");
  cookedAddress = cookedAddress.replace(/SIXTH/g, "6TH");
  cookedAddress = cookedAddress.replace(/SEVENTH/g, "7TH");
  cookedAddress = cookedAddress.replace(/EIGHTH/g, "8TH");
  cookedAddress = cookedAddress.replace(/NINTH/g, "9TH");

  //Special Cases 2 - Teens
  cookedAddress = cookedAddress.replace(/ELEVENTH/g, "11TH");
  cookedAddress = cookedAddress.replace(/TWELFTH/g, "12TH");
  cookedAddress = cookedAddress.replace(/THIRTEENTH/g, "13TH");
  cookedAddress = cookedAddress.replace(/FOURTEENTH/g, "14TH");
  cookedAddress = cookedAddress.replace(/FIFTEENTH/g, "15TH");
  cookedAddress = cookedAddress.replace(/SIXTEENTH/g, "16TH");
  cookedAddress = cookedAddress.replace(/SEVENTEENTH/g, "17TH");
  cookedAddress = cookedAddress.replace(/EIGHTEENTH/g, "18TH");
  cookedAddress = cookedAddress.replace(/NINETEENTH/g, "19TH");

  //Special Cases 3 - Multiples of Ten
  cookedAddress = cookedAddress.replace(/TENTH/g, "10TH");
  cookedAddress = cookedAddress.replace(/TWENTIETH/g, "20TH");
  cookedAddress = cookedAddress.replace(/THIRTIETH/g, "30TH");
  cookedAddress = cookedAddress.replace(/FOURTIETH/g, "40TH");
  cookedAddress = cookedAddress.replace(/FIFTIETH/g, "50TH");
  cookedAddress = cookedAddress.replace(/SIXTIETH/g, "60TH");
  cookedAddress = cookedAddress.replace(/SEVENTIETH/g, "70TH");
  cookedAddress = cookedAddress.replace(/EIGHTIETH/g, "80TH");
  cookedAddress = cookedAddress.replace(/NINETIETH/g, "90TH");

  //Special Cases 4 - Multiple of Ten in 1st digit

  cookedAddress = cookedAddress.replace(/TWENTY/g, "2");
  cookedAddress = cookedAddress.replace(/THIRTY/g, "3");
  cookedAddress = cookedAddress.replace(/FORTY/g, "4");
  cookedAddress = cookedAddress.replace(/FIFTY/g, "5");
  cookedAddress = cookedAddress.replace(/SIXTY/g, "6");
  cookedAddress = cookedAddress.replace(/SEVENTY/g, "7");
  cookedAddress = cookedAddress.replace(/EIGHTYY/g, "8");
  cookedAddress = cookedAddress.replace(/NINETY/g, "9");

  //Hundredth- includes a space beforehand

  cookedAddress = cookedAddress.replace(/ HUNDREDTH /g, "00");

  //Hundred- delete, whatever number is beforehand will concat with whatever is beyond it.

  cookedAddress = cookedAddress.replace(/ HUNDRED /g, "");

  //Digits
  cookedAddress = cookedAddress.replace(/ONE/g, "1");
  cookedAddress = cookedAddress.replace(/TWO/g, "2");
  cookedAddress = cookedAddress.replace(/THREE/g, "3");
  cookedAddress = cookedAddress.replace(/FOUR/g, "4");
  cookedAddress = cookedAddress.replace(/FIVE/g, "5");
  cookedAddress = cookedAddress.replace(/SIX/g, "6");
  cookedAddress = cookedAddress.replace(/SEVEN/g, "7");
  cookedAddress = cookedAddress.replace(/EIGHT/g, "8");
  cookedAddress = cookedAddress.replace(/NINE/g, "9");

  return cookedAddress;
}

/*
Description: This function retrieves the zestimate from the Zillow
			 API and returns the passed-in data object with a possibly
			 updated zestimate value. The async/ await allows for 
			 asynchrous functions to finish before being displayed.

Parameter(s):
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address

Return(s): 
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address with a possibly updated zestimate value
 */
async function handle_zillow_data(searchResultsData) {
  // First, grab zillow URL to query given entered address
  let zillowString = build_zillow_string(searchResultsData);

  // Next, we need to retrieve the XML result from the query
  let zillowXML = await retrieve_zillow_XML(zillowString);

  //Finally, grab the zestimate from the XML
  let zestimate = zillow_string_search(zillowXML);

  let sqFt = zillow_string_search_sqft(zillowXML);

  if (!isNaN(zestimate)) {
    // if zestimate is not null
    searchResultsData.zestimate = zestimate;
  }

  if (!isNaN(sqFt)) {
    // if zsqFt is not null
    searchResultsData.sqFt = sqFt;

    if (searchResultsData.avg >= 0) {
      // Calculates the average utility cost per square foot to 2 decimal places
      searchResultsData.avgUtilityCostPerSqFt = parseFloat(
        (searchResultsData.avg * 1.0) / searchResultsData.sqFt
      ).toFixed(2);
    }
  }

  return searchResultsData;
}

/*
Description: This takes the standardized address and zip code and will 
build the string for the API call.

Parameter(s):
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address 

Return(s): 
	- zillowString: string for the Zillow API call
 */
function build_zillow_string(searchResultsData) {
  //let zipcode = session.getItem("zipcode");
  let cookedAddress = searchResultsData.cookedAddress.replace(/ /g, "-"); // replace spaces in address with '-' to match Zillow API
  let zillowString =
    "https://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=X1-ZWz17kiq5jrqbv_1d5w6&address=" +
    cookedAddress +
    "&citystatezip=" +
    searchResultsData.zipcode +
    "&rentzestimate=true";

  return zillowString;
}

/*
Description: This function is used to retrieve the Zillow rental data from the back end
			query to Zillow's API.The async/ await allows for asynchrous functions to finish 
			before being displayed. 

Parameter(s):
  - zillowURL: the created zillow URL which will be used
				to query the Zillow API

Return(s):
  - result: the XML returned from querying the Zillow API
*/
async function retrieve_zillow_XML(zillowURL) {
  const result = await get_zillow_data(zillowURL);
  return result;
}

/*
Description: Takes the zillow response value as a string, and performs multiple
			 String operations on it, finding specific values that occur in all
			 responses, to narrow down and find the value of the rent zestimate, 
			 parses it as an integer, and returns that value.

Parameters: 
	- zillowXML: The XML response value passed in as string value.

Returns:
	- result: The zestimate value parsed and returned as an integer

*/
function zillow_string_search(zillowXML) {
  //Concat as a string to make sure it is a usable string
  let zillowString = "" + zillowXML + "";

  //This value will be search for to make a 'cut' in the string that is generic is all zillowXML return strings
  let firstCut = "rentzestimate";

  //Find the firstCut variable in the zillowString
  let firstSearch = zillowString.search(firstCut);

  //Creates a new string from a substring of the first string
  let secondString = zillowString.substring(firstSearch, zillowString.length);

  //Another cut in the string
  let secondCut = '"USD">';

  //Finds the secondCut
  let secondSearch = secondString.substring(
    secondString.search("USD"),
    secondString.length
  );

  //Creates another string from the  secondString, containing the rentzestimate value
  let finalString = secondSearch.substring(
    secondSearch.indexOf(">") + 1,
    secondSearch.indexOf("<")
  );

  //Parses the string value as an int in the decimal system
  let result = parseInt(finalString, 10);

  return result;
}

/*
Description: Takes the zillow response value as a string, and performs multiple
			 String operations on it, finding specific values that occur in all
			 responses, to narrow down and find the value of the finished square footage, 
			 parses it as an integer, and returns that value.

Parameters: 
	- zillowXML: The XML response value passed in as string value.

Returns:
	- result: The finished sqft value parsed and returned as an integer

*/
function zillow_string_search_sqft(zillowXML) {
  //Concat as a string to make sure it is a usable string
  let zillowString = "" + zillowXML + "";

  //This value will be search for to make a 'cut' in the string that is generic is all zillowXML return strings
  let firstCut = "<finishedSqFt>";

  //Find the firstCut variable in the zillowString
  let firstSearch = zillowString.search(firstCut);

  //Creates a new string from a substring of the first string
  let secondString = zillowString.substring(firstSearch, zillowString.length);

  //Another cut in the string
  let secondCut = ">";

  //Finds the secondCut
  let secondSearch = secondString.substring(
    secondString.search(secondCut),
    secondString.length
  );

  //Creates another string from the  secondString, containing the rentzestimate value
  let finalString = secondSearch.substring(
    secondSearch.indexOf(">") + 1,
    secondSearch.indexOf("<")
  );

  //Parses the string value as an int in the decimal system
  let result = parseInt(finalString, 10);

  return result;
}

/*
Description: If an average utility bill amount and a zestimate
             value were found for the property address, a total
			 cost is calculated and stored in the data object.

Parameters: 
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address

Returns:
	- searchResultsData: a custom object that contains all of the relevant information
	        for the property address with a possibly updated total cost value

*/
function calculate_total_cost(searchResultsData) {
  // If average utility bill amount and zestimate value are greater than 0
  if (searchResultsData.avg >= 0 && searchResultsData.zestimate >= 0) {
    searchResultsData.totalCost =
      searchResultsData.avg + searchResultsData.zestimate;
  }

  return searchResultsData;
}
