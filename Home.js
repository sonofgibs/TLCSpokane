import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window'; 

$w.onReady(function () 
{
});

/* 
Description: This function activates when the "Search" button is clicked. 
             The function stores the entered address and selected zipcode into
			 the user's session storage with Wix-Storage. These key-value pairs 
			 will be accessed on the Search Results page. After storage, this 
			 function navigates the user directly to the Search Results Page. 
			 User input validation ensures the user enters something into the 
			 address TB and makes a zipcode selection from the DD options.

Parameters:
	- event: The user's "Search" button click

Returns:
	- N/A
*/ 
export function searchBT_click(event) 
{
	// Retrieve the address and zipcode from the user's input 
	// and selection on the landing page
	let address = $w('#streetAddressTB').value;
	let zipcode = $w('#zipcodeDD').value;

	if (zipcode === "" && address.trim() === "") // no zipcode selected & no address entered
												 // address.trim() removes whitespace around input 
	{
		wixWindow.openLightbox("LD_addressZipcodeLB");
	}
	else if(zipcode === "") // no zipcode selected, but address entered
	{
		wixWindow.openLightbox("LD_zipcodeLB");
	}
	else if(address.trim() === "") // no address entered, but zipcode selected
	{
		wixWindow.openLightbox("LD_addressLB");
	}
	else // address entered & zipcode selected
	{
		// Store the address and zipcode in the user's session storage
		session.setItem("address", address)
		session.setItem("zipcode", zipcode);
		
		// Navigate to the Search Results page
		wixLocation.to("/search-results"); 
	}
}
