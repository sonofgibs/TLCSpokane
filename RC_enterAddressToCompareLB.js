/* 

Filename: RC_enterAddressToCompareLB

Author: Gonzaga University CPSC Team 10 2019-2020 

Description: This lightbox allows a user to enter an
				address to compare costs. 

*/

import { session } from "wix-storage";
import wixLocation from "wix-location";
import wixWindow from "wix-window";

$w.onReady(function () {});

/* 
Description: This function activates when the "Compare" button is clicked. 
             The function stores the entered address and selected zipcode into
			 the user's session storage with Wix-Storage. These key-value pairs 
			 will be accessed on the Results Comparison page. After storage, this 
			 function navigates the user directly to the Results Comparison Page. 
			 User input validation ensures the user enters something into the 
			 address TB and makes a zipcode selection from the DD options.

Parameters:
	- event: The user's "Search" button click

Returns:
	- N/A
*/
export function compareBT_click(event) {
  // Retrieve the address and zipcode from the user's input
  // and selection on the RC_enterAddressToCompareLB
  let address = $w("#streetAddressTB").value;
  let zipcode = $w("#zipcodeDD").value;

  if (zipcode === "" && address.trim() === "") {
    $w("#zipcodeValidationTB").show();
    $w("#addressValidationTB").show();
  } else if (zipcode === "") {
    // no zipcode selected
    $w("#zipcodeValidationTB").show();
    $w("#addressValidationTB").hide();
  } else if (address.trim() === "") {
    // no address entered
    $w("#addressValidationTB").show();
    $w("#zipcodeValidationTB").hide();
  } // address entered & zipcode selected
  else {
    // Store the address and zipcode in the user's session storage
    session.setItem("newAddress", address);
    session.setItem("newZipcode", zipcode);

    // Navigate to the Search Results page
    wixLocation.to("/refresher");
  }
}
