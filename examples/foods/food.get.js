'use strict';

const fatAPI = require('../fatAPI');

// get a specific food by id
fatAPI
  .method('food.get', {
    food_id: 14102545
  })
  .then(function(food) {
    console.json(food);
  });
