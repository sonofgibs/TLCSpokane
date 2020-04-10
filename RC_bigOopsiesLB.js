// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixLocation from 'wix-location';
import { session } from 'wix-storage';
import wixWindow from 'wix-window';

$w.onReady(function () {
	populate_form_fields()
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

function populate_form_fields() 
{
	// Disable the user's capability to edit the streetAddress
    // and zipcode fields
	$w("#streetAddressTB").disable();
	$w("#zipcodeTB").disable();

	// Get address and zipcode from Wix-Storage
	let address = session.getItem("newAddress");
	let zipcode = session.getItem("newZipcode");

	// Set the streetAddress and zipcode fields
    // based on what the user had previously entered
	$w('#streetAddressTB').value = address;
	$w('#zipcodeTB').value = zipcode;
}

/*
Description: 


*/
export function button4_click(event, comparisonLBFlag) {
	// open lightbox to enter new address for comparison
	wixWindow.openLightbox("RC_enterAddressToCompareLB");
}
