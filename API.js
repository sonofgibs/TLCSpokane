import { fetch } from 'wix-fetch';

/*
Description: This function is used to retrieve the 
             Zillow rental data for a certain address 
             by querying Zillow's API.

Parameter(s):
  - zillowURL: the URL used to query the Zillow API

Return(s):
  - zillowXMLResponse: a string of the XML response from the Zillow API
*/
export async function get_zillow_data(zillowURL)
{
  // variable must be defined outside of the fetch
  // in order to store the XML response as a string
  let zillowXMLResponse = "";
 
  // async and await are necessary in order to allow 
  // "wait" time for the query
  let response = await fetch(zillowURL, {method: 'get'})
  .then(httpResponse => httpResponse.text())
  .then(text => text.replace(/"/g,"\\\"" )) // replaces all quotation marks with 
                                            // \" to prevent fragmentation
  .then(function (text)
  {
    // assignment to the externally defined variable
    // allows for return outside of fetch
    zillowXMLResponse = text;
  });

  return zillowXMLResponse;
}
