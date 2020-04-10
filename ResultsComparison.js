import { session } from 'wix-storage';
import wixWindow from 'wix-window';
import { handle_search_results_data } from 'backend/HandleData';
import wixLocation from 'wix-location';


$w.onReady(function () {
	//wixLocation.to(wixLocation.url);
	prepare_data();

});

/*
Description: This function gathers address data as inputted by the user,
	         then sends this data to be cooked and displayed. The async/await
	         allows for asynchrous functions to finish before being displayed.

Parameters:
	- N/A

Returns:
	- N/A
*/
async function prepare_data() 
{
	// Get previous and new address and zipcode from Wix-Storage
	let prevAddress = session.getItem("address");
	let prevZipcode = session.getItem("zipcode");
	let newAddress = session.getItem("newAddress");
	let newZipcode = session.getItem("newZipcode");

	// Call the BE function to perform all of the queries, API calls, and calculations
	// Returns data objects with properties that contain all of the useful information
	let prevRCData = await handle_search_results_data(prevAddress, prevZipcode);
	let newRCData = await handle_search_results_data(newAddress, newZipcode);

	// Display the data to the UI
	display_data(prevRCData, newRCData);
}

/*
Description: This function displays all known Avista and Zillow values on the
			 page. If all values are missing or the data cannot be found in
			 either dataset, an error message will appear with the option for the user
			 to search again. If only some values are missing, a different error
			 message will appear and all known values will be displayed.

Parameters:
	- prevRCData: contains high, low, and average monthly utility bills, and also contains
				  average utility cost per square foot and Zillow's rent Zestimate for the 
				  original address

	- newRCData: contains high, low, and average monthly utility bills, and also contains
				 average utility cost per square foot and Zillow's rent Zestimate for the 
				 new address
				  
Returns:
	- N/A
*/
function display_data(prevRCData, newRCData)
{
	// previous address
	$w('#previousAddressTB').text = prevRCData.cookedAddress;	// display address

	// Does this if all values are there (high, low, avg, zestimate, sq. ft.)
	if (prevRCData.high >= 0 && prevRCData.low >= 0 && prevRCData.avg >= 0 && prevRCData.zestimate >= 0 && prevRCData.avgUtilityCostPerSqFt >= 0) {
		// Calculate total cost and display it
		prevRCData.totalCost = eval(parseFloat(prevRCData.zestimate).toFixed(2)) + eval(parseFloat(prevRCData.avg).toFixed(2)); 	// zestimate and average are rounded to 2nd decimal

		//Display average utility cost per square foot
		console.log("\navgUtilityCostPerSqFt: ", prevRCData.avgUtilityCostPerSqFt);
		$w('#previousTotalCostTB').text = "Total Estimated Monthly Cost: $" + prevRCData.totalCost;

		// display inputted address, electric breakdown, and rental breakdown
		$w('#previousHighTB').text = "High: $" + prevRCData.high;
		$w('#previousLowTB').text = "Low: $" + prevRCData.low;
		$w('#previousAvgTB').text = "Avg: $" + prevRCData.avg;
		$w('#previousRentZestimateTB').text = "Zillow's Rent Zestimate: $" + prevRCData.zestimate;
		$w('#previousCostPerSqFtTB').text = "Cost per Sq Ft: $" + prevRCData.avgUtilityCostPerSqFt;
	}

	// Only want this statement to execute if address is not in the Avista or Zillow databases.
	else if (prevRCData.high === -1 && prevRCData.low === -1 && prevRCData.avg === -1 && prevRCData.zestimate === -1 && prevRCData.avgUtilityCostPerSqFt === -1) {
		$w('#previousAddressTB').text = prevRCData.cookedAddress;
		// display null total cost
		$w('#previousTotalCostTB').text = "Total Estimated Monthly Cost: $--";

		// display inputted address and null electric and rental breakdowns
		$w('#previousAddressTB').text = prevRCData.cookedAddress;
		$w('#previousHighTB').text = "High: $--";
		$w('#previousLowTB').text = "Low: $--";
		$w('#previousAvgTB').text = "Avg: $--";

		// display null zestimate and cost per square foot
		$w('#previousRentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		$w('#previousCostPerSqFtTB').text = "Cost per Sq Ft: $--";

	}

	// When some values (not all) are missing
	// Some values could be from Avista, some could be from Zillow
	else {
		
		// Allows all known values to be displayed
		if (prevRCData.high !== -1) {
			$w('#previousHighTB').text = "High: $" + prevRCData.high;
		} else {
			$w('#previousHighTB').text = "High: $--";
		}

		if (prevRCData.low !== -1) {
			$w('#previousLowTB').text = "Low: $" + prevRCData.low;
		} else {
			$w('#previousLowTB').text = "Low: $--";
		}

		if (prevRCData.avg !== -1) {
			$w('#previousAvgTB').text = "Avg: $" + prevRCData.avg;
		} else {
			$w('#previousAvgTB').text = "Avg: $--";
		}

		if (prevRCData.zestimate !== -1) {
			$w('#previousRentZestimateTB').text = "Zillow's Rent Zestimate: $" + prevRCData.zestimate;
		} else {
			$w('#previousRentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		}

		if (prevRCData.avgUtilityCostPerSqFt !== -1) {
			$w('#previousCostPerSqFtTB').text = "Cost per Sq Ft: $" + prevRCData.avgUtilityCostPerSqFt;
		} else {
			$w('#previousCostPerSqFtTB').text = "Cost per Sq Ft: $--";
		}

		// Can still display Total Cost if we have avg and zestimate
		if (prevRCData.avg !== -1 && prevRCData.zestimate !== -1) {
			$w('#previousTotalCostTB').text = "Total Estimated Monthly Cost: $" + prevRCData.totalCost;
		} else {
			// display null total cost
			$w('#previousTotalCostTB').text = "Total Estimated Monthly Cost: $--";
		}
	}


	// new address
	$w('#newAddressTB').text = newRCData.cookedAddress;	// display address

	// Does this if all values are there (high, low, avg, zestimate, sq. ft.)
	if (newRCData.high >= 0 && newRCData.low >= 0 && newRCData.avg >= 0 && newRCData.zestimate >= 0 && newRCData.avgUtilityCostPerSqFt >= 0) {
		// Calculate total cost and display it
		newRCData.totalCost = eval(parseFloat(newRCData.zestimate).toFixed(2)) + eval(parseFloat(newRCData.avg).toFixed(2)); 	// zestimate and average are rounded to 2nd decimal

		//Display average utility cost per square foot
		console.log("\navgUtilityCostPerSqFt: ", newRCData.avgUtilityCostPerSqFt);
		$w('#newTotalCostTB').text = "Total Estimated Monthly Cost: $" + newRCData.totalCost;

		// display inputted address, electric breakdown, and rental breakdown
		$w('#newHighTB').text = "High: $" + newRCData.high;
		$w('#newLowTB').text = "Low: $" + newRCData.low;
		$w('#newAvgTB').text = "Avg: $" + newRCData.avg;
		$w('#newRentZestimateTB').text = "Zillow's Rent Zestimate: $" + newRCData.zestimate;
		$w('#newCostPerSqFtTB').text = "Cost per Sq Ft: $" + newRCData.avgUtilityCostPerSqFt;
	}

	// Only want this statement to execute if address is not in the Avista or Zillow databases.
	else if (newRCData.high === -1 && newRCData.low === -1 && newRCData.avg === -1 && newRCData.zestimate === -1 && newRCData.avgUtilityCostPerSqFt === -1) {
		$w('#newAddressTB').text = newRCData.cookedAddress;
		
		// display null total cost
		$w('#newTotalCostTB').text = "Total Estimated Monthly Cost: $--";

		// display inputted address and null electric and rental breakdowns
		$w('#newAddressTB').text = newRCData.cookedAddress;
		$w('#newHighTB').text = "High: $--";
		$w('#newLowTB').text = "Low: $--";
		$w('#newAvgTB').text = "Avg: $--";

		// display null zestimate and cost per square foot
		$w('#newRentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		$w('#newCostPerSqFtTB').text = "Cost per Sq Ft: $--";
		

		// Display "Big Oopsies" 
		wixWindow.openLightbox("RC_bigOopsiesLB");


	}

	// When some values (not all) are missing
	// Some values could be from Avista, some could be from Zillow
	else {
		// Display Error LightBox
		wixWindow.openLightbox("RC_oopsiesLB");

		// Allows all known values to be displayed
		if (newRCData.high !== -1) {
			$w('#newHighTB').text = "High: $" + newRCData.high;
		} else {
			$w('#newHighTB').text = "High: $--";
		}

		if (newRCData.low !== -1) {
			$w('#newLowTB').text = "Low: $" + newRCData.low;
		} else {
			$w('#newLowTB').text = "Low: $--";
		}

		if (newRCData.avg !== -1) {
			$w('#newAvgTB').text = "Avg: $" + newRCData.avg;
		} else {
			$w('#newAvgTB').text = "Avg: $--";
		}

		if (newRCData.zestimate !== -1) {
			$w('#newRentZestimateTB').text = "Zillow's Rent Zestimate: $" + newRCData.zestimate;
		} else {
			$w('#newRentZestimateTB').text = "Zillow's Rent Zestimate: $--";
		}

		if (newRCData.avgUtilityCostPerSqFt !== -1) {
			$w('#newCostPerSqFtTB').text = "Cost per Sq Ft: $" + newRCData.avgUtilityCostPerSqFt;
		} else {
			$w('#newCostPerSqFtTB').text = "Cost per Sq Ft: $--";
		}

		// Can still display Total Cost if we have avg and zestimate
		if (newRCData.avg !== -1 && newRCData.zestimate !== -1) {
			$w('#newTotalCostTB').text = "Total Estimated Monthly Cost: $" + newRCData.totalCost;
		} else {
			// display null total cost
			$w('#newTotalCostTB').text = "Total Estimated Monthly Cost: $--";
		}
	}

}
