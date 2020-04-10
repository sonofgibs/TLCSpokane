import { session } from 'wix-storage';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { handle_search_results_data } from 'backend/HandleData';

$w.onReady(function () {
	prepare_data();

});

/*
Description: This function gathers address data as inputted by the user,
	then sends this data to be cooked and displayed. The async/ await
	allows for asynchrous functions to finish before being displayed.

Parameters:
	-N/A

Returns:
	-N/A
*/
async function prepare_data() {
	// Get address and zipcode from Wix-Storage
	let address = session.getItem("address");
	let zipcode = session.getItem("zipcode");

	// Call the BE function to perform all of the queries, API calls, and calculations
	// Returns data, an object with properties that contain all of the useful information
	let searchResultsData = await handle_search_results_data(address, zipcode);

	// Display the data to the UI
	display_data(searchResultsData);
}

/* 
Description: This function calculates a "Sticker Price" (totalCost) and displays these 
values on the Search Results Page.

Parameters:
- searchResultsData: a custom object that contains all of the relevant information
	for the property address, which has been cooked
 
Displays: 
-	Entered Address
-	High/Low/Avg information
-	Rent Zestimate
-	Total Cost
*/
function display_data(searchResultsData) {
	// set address text field to user's entered address
	$w('#addressTB').text = searchResultsData.cookedAddress;

	// Does this if all values are there (high, low, avg, zestimate, sq. ft.)
	if (searchResultsData.high >= 0 && searchResultsData.low >= 0 && searchResultsData.avg >= 0 && searchResultsData.zestimate >= 0 && searchResultsData.avgUtilityCostPerSqFt >= 0) {
		// Calculate total cost and display it
		//totalCost = eval(parseFloat(data.zestimate).toFixed(2)) + eval(parseFloat(data.avg).toFixed(2)); 	// zestimate and average are rounded to 2nd decimal

		//Display average utility cost per square foot
		$w('#totalCostTB').text = "Total Estimated Monthly Cost: $" + searchResultsData.totalCost;

		// display inputted address, electric breakdown, and rental breakdown
		$w('#highTB').text = "High: $" + searchResultsData.high;
		$w('#lowTB').text = "Low: $" + searchResultsData.low;
		$w('#avgTB').text = "Avg: $" + searchResultsData.avg;
		$w('#rentZestimateTB').text = "Zillow's Rent Zestimate: $" + searchResultsData.zestimate;
		$w('#CostPerSqFtTB').text = "Cost per Sq Ft: $" + searchResultsData.avgUtilityCostPerSqFt;
	}

	// Only want this statement to execute if address is not in the Avista or Zillow databases.
	else if (searchResultsData.high === -1 && searchResultsData.low === -1 && searchResultsData.avg === -1 && searchResultsData.zestimate === -1 && searchResultsData.avgUtilityCostPerSqFt === -1) {
		$w('#addressTB').text = searchResultsData.cookedAddress;
		// display null total cost
		$w('#totalCostTB').text = "Total Estimated Monthly Cost: $--";

		// display inputted address and null electric and rental breakdowns
		$w('#addressTB').text = searchResultsData.cookedAddress;
		$w('#highTB').text = "High: $--";
		$w('#lowTB').text = "Low: $--";
		$w('#avgTB').text = "Avg: $--";

		// display null zestimate and cost per square foot
		$w('#rentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		$w('#CostPerSqFtTB').text = "Cost per Sq Ft: $--";

		// Display "Big Oopsies" 
		wixWindow.openLightbox("SR_bigOopsiesLB");
	}

	// When some values (not all) are missing
	// Some values could be from Avista, some could be from Zillow
	else {
		// Display Error LightBox
		wixWindow.openLightbox("SR_oopsiesLB");

		// Allows all known values to be displayed
		if (searchResultsData.high !== -1) {
			$w('#highTB').text = "High: $" + searchResultsData.high;
		} else {
			$w('#highTB').text = "High: $--";
		}

		if (searchResultsData.low !== -1) {
			$w('#lowTB').text = "Low: $" + searchResultsData.low;
		} else {
			$w('#lowTB').text = "Low: $--";
		}

		if (searchResultsData.avg !== -1) {
			$w('#avgTB').text = "Avg: $" + searchResultsData.avg;
		} else {
			$w('#avgTB').text = "Avg: $--";
		}

		if (searchResultsData.zestimate !== -1) {
			$w('#rentZestimateTB').text = "Zillow's Rent Zestimate: $" + searchResultsData.zestimate;
		} else {
			$w('#rentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		}

		if (searchResultsData.avgUtilityCostPerSqFt !== -1) {
			$w('#CostPerSqFtTB').text = "Cost per Sq Ft: $" + searchResultsData.avgUtilityCostPerSqFt;
		} else {
			$w('#CostPerSqFtTB').text = "Cost per Sq Ft: $--";
		}

		// Can still display Total Cost if we have avg and zestimate
		if (searchResultsData.avg !== -1 && searchResultsData.zestimate !== -1) {
			$w('#totalCostTB').text = "Total Estimated Monthly Cost: $" + searchResultsData.totalCost;
		} else {
			// display null total cost
			$w('#totalCostTB').text = "Total Estimated Monthly Cost: $--";
		}
	}
}