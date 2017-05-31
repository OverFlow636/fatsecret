# FatSecret Node
This package provides a node module for the FatSecret.com rest api.

## Quick Start
```javascript
const fatAPI = new require('fatsecret')(KEY, SECRET);

fatAPI
  .method('foods.search', {
    search_expression: 'Coffiest',
    max_results: 10
  })
  .then(function(results) {
    console.log(results.foods.food);
  })
  .catch(err => console.error(err));

/* result
[
  {
    "brand_name": "Rosa Labs",
    "food_description": "Per 1 bottle - Calories: 400kcal | Fat: 21.00g | Carbs: 37.00g | Protein: 20.00g",
    "food_id": "13010133",
    "food_name": "Coffiest",
    "food_type": "Brand",
    "food_url": "http://www.fatsecret.com/calories-nutrition/rosa-labs/coffiest"
  },
  {
    "brand_name": "Soylent",
    "food_description": "Per 1 bottle - Calories: 400kcal | Fat: 21.00g | Carbs: 37.00g | Protein: 20.00g",
    "food_id": "14102545",
    "food_name": "Coffiest",
    "food_type": "Brand",
    "food_url": "http://www.fatsecret.com/calories-nutrition/soylent/coffiest"
 f }
]
*/
```

## Methods

### method(apiMethod, params)
This function can be used to call any of the fatsecret.com documented api methods. See [Here](http://platform.fatsecret.com/api/Default.aspx?screen=rapiref) for a full list and the params to pass.

### setUserAuth(token, secret)
Sets the user account token and secret to use for future calls (through `method`) that return details about a user.

### getOauthUrl()
Gets a url to send a user to to grant access to your integration.

### getAccessToken(token, secret, code)
Exchange a token, secret, and code for another token and secret bound to the users fatsecret.com account.

## Examples
Check the examples directory for more examples on specific fatsecret.com api methods.

Run them like `FS_KEY=... FS_SECRET=... node examples/foods/foods.search.js`
