'use strict';

const fatAPI = require('../fatAPI');

// search for a food
fatAPI
  .method('foods.search', {
    search_expression: 'Coffiest',
    max_results: 10
  })
  .then(function(results) {
    console.json(results.foods.food);
  });
