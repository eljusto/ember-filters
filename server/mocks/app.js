module.exports = function(app) {
  var express = require('express');
  var apiRouter = express.Router();

  var categories = [
    {
      id: 'cat',
      title: 'Categories',
      items: [
        {"id": "type|ring", "title": "ring", "weight":10},
      ]
    }
  ];

  var products = [
    {
      id: 1,
      title: 'Product 1',
      image: 'http://placekitten.com/400/340',
      sku: 'FC532-5656'
    },
    {
      id: 2,
      title: 'Product 2',
      image: 'http://placekitten.com/400/340',
      sku: 'FC-DFG'
    },
  ];

  var filters = [
    {
      id: 'filter',
      title: 'Filter',
      items: [
        {
          name: 'customer',
          title: 'Customer',
          dictionary: 'customersByTags',
          textFields: [
            {name: 'name'}
          ],
          inputTemplate: 'searchlist',
          isPlural: true
        },
        {
          name: 'tag',
          title: 'Tag',
          dictionary: 'tags',
          textFields: [
            {name: 'name'}
          ],
          inputTemplate: 'autocomplete',
          isPlural: true
        },
        {
          name: 'requestNo',
          title: 'Request No',
          textFields: [
            {name: 'name'}
          ],
          isPlural: true
        },
        {
          name: 'hierarchy',
          title: 'Hierarchy',
          dictionary: 'hierarchy',
          textFields: [
            {name: 'name'}
          ],
          inputTemplate: 'hierarchy',
          isPlural: true
        }
      ]},
    {
      id: 'sales',
      title: 'sales',
      items: [
        {
          name: 'price',
          title: 'price',
          measureUnit: '$',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true,
          isPlural: true,
          validation: {
            type: 'number'
          }
        },
        {
          name: 'byTime',
          title: 'By Time',
          textFields: [
            {name: 'gte'},
            {name: 'lte'},
            {name: 'mode'}
          ],
          filterMode: 'include',
          inputTemplate: 'bytime',
          isGlobal: true
        },
        {
          name: 'considerInTableView',
          title: 'Consider `By Time` in Table View',
          sorting: true
        },
        {
          name: 'salesByPrice',
          title: 'Sales by $',
          measureUnit: '$',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          calendar: "period",
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true,
          isPlural: true,
          validation: {
            type: 'number'
          }
        },
        {
          name: 'salesByQty',
          title: 'Sales by Q',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          calendar: "period",
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true,
          isPlural: true,
          validation: {
            type: 'number'
          }
        },
        {
          name: 'returnPercent',
          title: 'Return',
          measureUnit: '%',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          calendar: "period",
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true,
          isPlural: true,
          validation: {
            type: 'number',
            minValue: 0,
            maxValue: 100
          }
        },
        {
          name: 'clearance',
          title: 'clearance',
          useCalendar: true,
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true
        },
        {
          name: 'discontinued',
          title: 'discontinued',
          useCalendar: true,
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-searchlist'}
          ],
          sorting: true,
          isPlural: true
        },
        {
          name: 'dateCreated',
          title: 'Date Created',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          inputTemplate: 'date-picker',
          sorting: true
        },
        {
          name: 'dateOrdered',
          title: 'Date Ordered',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          inputTemplate: 'date-picker',
          sorting: true
        }
      ]
    },
    {
      id: 'inventory',
      title: 'inventory',
      items: [
        {
          name: 'invTotal',
          title: 'Total',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          subcriterias: [
            {dictionary: 'warehouses', template: 'filters/sub-dictionary'}
          ],
          sorting: true
        },
        {
          name: 'invAvailable',
          title: 'Available',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ],
          subcriterias: [
            {dictionary: 'locations', template: 'filters/sub-dictionary'}
          ],
          sorting: true
        },
        {
          name: 'invOnOrder',
          title: 'On order',
          textFields: [
            {name: 'gte'},
            {name: 'lte'}
          ]
        },
        {
          name: 'invStatus',
          title: 'Status',
          textFields: [
            {name: 'name'}
          ],
          dictionary: 'inventoryStatus',
          inputTemplate: 'dictionary-select',
          isPlural: true,
          subcriterias: [
            {dictionary: 'customers', template: 'filters/sub-dictionary'}
          ]
        },
        {
          name: 'bestseller',
          title: 'Bestseller',
          inputTemplate: 'empty',
          isHidden: true
        }
      ]
    }
  ];

  var customersByTags = [
    {
      "id": "AFU#5",
      "briefName": "AFU",
      "name": "Amazon.com AFU"
    },
    {
      "id": "amazon_ca_tag#12",
      "briefName": "amazon_ca_tag",
      "name": "Amazon.com CA"
    },
  ];

  var customers = [
    {
      "id": "AFS#24",
      "briefName": "AFS",
      "name": "AAFES",
      "weight": 21,
    },
    {
      "id": "Allurez#14",
      "briefName": "Allurez",
      "name": "Allurez",
      "weight": 1,
    },
  ];

  var locations = [
    {id: 'location1', name: 'Location 1'},
    {id: 'location2', name: 'Location 2'},
    {id: 'location3', name: 'Location 3'},
    {id: 'location4', name: 'Location 4'},
    {id: 'location5', name: 'Location 5'},
    {id: 'location6', name: 'Location 6'},
    {id: 'location7', name: 'Location 7'}
  ];

  var warehouses = [
    {"id":"WRHS1","briefName":"WRHS1","name":"Warehouse 1"},
    {"id":"WRHS2","briefName":"WRHS2","name":"Warehouse 2"},
  ];

  var statuses = [
    {id: 'force_zero',  name: 'Send 0'},
    {id: 'min_qty',     name: 'Min Qty'},
    {id: 'eta',         name: 'ETA'},
    {id: 'dns_flag',    name: 'DNS'},
    {id: 'dnr_flag',    name: 'DNR'},
    {id: 'size_tolerance',    name: 'Size Tolerance'},
    {id: 'phantom_inventory', name: 'Phantom'}
  ];

  var tags = [
    {id: 'tag1', name: 'Tag 1'},
    {id: 'tag2', name: 'Tag ab'},
    {id: 'tag3', name: 'Tag bc'},
    {id: 'tag4', name: 'Tag cde'},
    {id: 'tag5', name: 'Tag d'},
    {id: 'tag6', name: 'Tag 2'},
    {id: 'tag7', name: 'Tag gj'},
    {id: 'tag8', name: 'Tag ety'},
    {id: 'tag9', name: 'Tag 4'},
    {id: 'tag10', name: 'Tag 6'}

  ];

  var hierarchy = [
    {
      levels: [
        {id: 'dept', name: 'Dept'},
        {id: 'subdept', name: 'SubDept'},
        {id: 'classname', name: 'ClassName'}
      ],
      items: [
        { id: 100,
          name: 'Pearl Strands Finished',
          subitems: [
            { id: 10,
              name: 'Akoya',
              subitems: [
                { id: 1, name: 'Necklaces' },
                { id: 2, name: 'Bracelets' }
              ]
            },
            { id: 19,
              name: 'Freshwater',
              subitems: [
                { id: 1, name: 'Necklaces' },
                { id: 2, name: 'Bracelets' }
              ]
            }
          ]
        },
        {
          id: 102,
          name: 'Pearl Jewellery',
          subitems: [
            { id: 23,
              name: 'Necklaces/Pendants',
              subitems: [
                { id: 4, name: 'FW' },
                { id: 5, name: 'Tahitlan' }
              ]
            },
            {
              id: 15,
              name: 'Earrings',
              subitems: [
                { id: 4, name: 'FW' },
                { id: 5, name: 'Tahitlan' }
              ]
            }
          ]
        }
      ]
    }
  ];

  apiRouter.get('/searchCriteriasObjects/1', function (req, res) {
    var searchCategories = [];
    if (req.query.categories && req.query.categories.length > 0) {
      searchCategories = JSON.parse(req.query.categories);
    }
    var searchStringList = '';
    if (req.query.search) {
      searchStringList = JSON.parse(req.query.search);
    }
    var appliedFilters;
    if (req.query.filters) {
      appliedFilters = JSON.parse(req.query.filters);
    }
    var appliedCategories;
    if (req.query.appliedCategories) {
      appliedCategories = JSON.parse(req.query.appliedCategories);
    }
    var appliedSearch;
    if (req.query.appliedSearch) {
      appliedSearch = JSON.parse(req.query.appliedSearch);
    }
    res.send({
      'search-criterias-object': {
        id: 1,
        'categories': categories,
        'dictionaries': {
          'customers': customers,
          'customersByTags': customersByTags,
          'locations': locations,
          'inventoryStatus': statuses,
          'hierarchy': hierarchy,
          'warehouses': warehouses
        },
        'filters': filters,

        'appliedFilters': appliedFilters,
        'appliedCategories': appliedCategories,
        'appliedSearch': appliedSearch,
      }
    });
  });

  apiRouter.get('/autocomplete/tags/:title', function (req, res) {
    var matched = [];
    var searchString = req.params.title;
    if (searchString.length > 2) { //don't search text less than 2 characters
      tags.forEach(function (tag) {
        if (new RegExp(searchString).test(tag.name)) {
          matched.push(tag);
        }
      });
    }
    var result = { "tags": matched };
    res.send(result);
  });

  apiRouter.post('/autocomplete', function (req, res) {
    var matched = [];
    var result = {
      status : "error",
      reason : "something went wrong"
    };
    var searchObject = (req.body.search) ? JSON.parse(req.body.search) : [{}];
    var searchString = searchObject[0].text || "";
console.log(req.body.search);
    //don't search text less than 2 characters
    if ( searchString && searchString.length > 2 ) {
      products.forEach(function (product) {
        if (new RegExp(searchString).test(product.title)) {
          matched.push(product);
        }
      });
      result = { product : matched, status : "ok" };
    } else {
      result = { status: "error", reason : "Can't find " + searchString };
    }
    res.send(result);
  });


  app.use('/api/', apiRouter);
};
