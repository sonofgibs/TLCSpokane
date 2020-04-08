/* 

Filename: SR_bigOopsiesLB

Author: Gonzaga University CPSC Team 10 2019-2020 

Description: This file notifies the user when Avista nor 
				Zillow data were found for a specific address.
				This lightbox also allows a user to enter
				this address for our team to review.

*/

import wixLocation from "wix-location";
import { session } from "wix-storage";

$w.onReady(function () {
  populate_form_fields();
});

/*
Description: Populates the form fields based on the streetAddress and zipcode
             previously entered by the user. Disables the user from changing
			 the values.

Parameters:
	- N/A

Returns:
	- Displays, but does not allow editing, within the streetAddressTB and
	  zipcodeTB fields
*/
function populate_form_fields() {
  // Disable the user's capability to edit the streetAddress
  // and zipcode fields
  $w("#streetAddressTB").disable();
  $w("#zipcodeTB").disable();

  // Get address and zipcode from Wix-Storage
  let address = session.getItem("address");
  let zipcode = session.getItem("zipcode");

  // Set the streetAddress and zipcode fields
  // based on what the user had previously entered
  $w("#streetAddressTB").value = address;
  $w("#zipcodeTB").value = zipcode;
}

/*
Description: Returns the user to the home page when 
			they click the search again button.

Parameters:
	- event: the click of the search again button

Returns:
	- N/A
*/
export function button1_click(event) {
  wixLocation.to("/");
}
