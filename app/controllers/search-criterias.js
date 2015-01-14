/* global App:false, moment:false */

import ajax from 'ic-ajax';

export default Ember.ObjectController.extend( Ember.Evented, {
// controller properties

  isDataRefreshing: false,
  resultsSearchText: '',
  productSearchText: '',
  flagAppliedFilterRemoved: undefined,
  flagAppliedCategoriesRemoved: undefined,
  flagAppliedSearchRemoved: undefined,
  modalMsgType: 'save',
  popupOpened: false,
  showSelected: false,

  searchCriterias: Em.Object.create({
    'search'         : Em.A(),
    'categories'     : Em.A(),
    'filters'        : Em.A()
  }),

  displayedCriterias: Em.Object.create({
    'search'         : Em.A(),
    'categories'     : Em.A(),
    'filters'        : Em.A()
  }),


  currentSort: {'order':'asc','type':'description'},

  currentSearchTypeTitle: function(){
    var st = this.get('model.topSearchFields');
    var search = this.get('searchCriterias.search');
    var searchBy = this.get('currentSearchType');
    var searchByObj = search.findBy('searchBy');
    if (!searchBy && searchByObj) {
      searchBy = searchByObj.searchBy;
      this.set('currentSearchType',searchBy);
    }
    if (searchBy){
      var searchType = st.findBy('id', searchBy);
        if (searchType !== undefined) {
          return searchType.title;
      }
    }
    return 'All';
  }.property('currentSearchType'),

  areFiltersApplied: function(){
    var cats = this.get('displayedCriterias.categories');
    var sTextList = this.get('displayedCriterias.search');
    var filters = this.get('displayedCriterias.filters');
    return cats.length || sTextList.length || filters.length;
  }.property('displayedCriterias.filters.@each'),

  areFiltersExist: function() {
    return (this.get('model.filters.content').length > 0);
  }.property('model.filters'),

  //controller actions
  actions: {
    filterModeUpdated: function(filter){
      var filterMode = filter.get('filterMode');
      if (filterMode === 'exclude' || filter.isFilled()) {
        if (filterMode === 'exclude')
        {
          this.set('flagAppliedFilterRemoved',true);
        }
        filter.switchFilterMode();
        this.reloadData();
      }
    },

    filterApplied: function(filter){
      var filterMode = filter.get('filterMode');
      if (filterMode != null && filterMode !== 'off')
      {
        this.reloadData();
      }
    },

    goAction: function(filter, switchMode) {
      filter.sanitizeTextFields();
      if (filter.isFilled()) {
        filter.validate();
        if (filter.get('isValid')) {
          var filterMode  = filter.get('filterMode');
          if (filterMode != null && filterMode !== 'off' && !switchMode)
          {
            this.send('filterApplied',filter);
          } else {
            this.send('filterModeUpdated',filter);
          }
        }
      }
    },

    productSearchValueChanged: function(sku) {
      if (typeof sku === 'string') {
        sku = sku.trim();
        if (sku) {
          this.setTextList([sku]);
        }
      }
    },

    setSearchType: function(searchId){
      var searchType = this.get('currentSearchType');
      if (searchType !== searchId) {
        this.set('currentSearchType',searchId);
        var searchText = this.get('searchCriterias.search.text');
        if (searchText) {
          this.reloadData();
        }
      }
    },

    setSortType: function(type, order){
      /* Set currentSort */
      this.set('currentSort', {'type': type, 'order':order});
      /* Remove sort order for Filters */
      var filters = this.get('model.filters');
      filters.forEach(function(groupFilters){
        groupFilters.get('items').content.forEach(function(filter){
          filter.set('sortOrder','off');
          filter.get('linkedFilterItems').content.forEach(function(lf){
            lf.set('sortOrder','off');
          });
        });
      });
      /* Controller reload */
      this.reloadData();
    },

    chooseCategory: function(categoryId) {
      var sc = this.get('searchCriterias.categories');
      var category = this.get('categories.content')[0];
      category.get('items').content.forEach(function(item){
        var mode = item.get('mode');
          if (mode === 'exclude') {
            item.set('weight',item.get('weight')-2);
          }
          else if (mode === 'include') {
            item.set('weight',item.get('weight')-1);
          }
        var ac = sc.filter(function(el){
          return el.id === item.id;
        });
        sc.removeObjects(ac);
      });
      if (sc.length === 0) {
        this.set('flagAppliedCategoriesRemoved',true);
      }
      this.reloadData();
    },

    newFilterRow: function(filter) {
      if (filter.isFilled() && !filter.hasEmptyLinkedFilters()) {
        filter.addLinkedFilter(null);
      }
    },

    categoryCheckboxChecked: function(category){
      var sc = this.get('searchCriterias.categories');
      category.switchMode();
      var mode = category.get('mode');
      if (mode !== 'include'){
        var ac = sc.filter(function(el){
          return el.id === category.id;
        });
        sc.removeObjects(ac);
      }
      var weight = category.get('weight');
      if (mode === 'include' || mode === 'exclude'){
        sc.pushObject({id: category.id, 'mode': mode, parent: category.get('category.id') });
        category.set('weight',weight+1);
      } else {
        category.set('weight',weight-2);
      }
      if (sc.length === 0) {
        this.set('flagAppliedCategoriesRemoved',true);
      }
      this.reloadData();
    },

    resultsSearchFormSubmit: function(){
      var searchText = this.get('resultsSearchText').trim();
      var search = this.get('searchCriterias.search');
      if (searchText.length > 0 && !search.findBy('text',searchText)) {
        this.set('resultsSearchText', '');
        var obj = {'text' : searchText};
        search.pushObject(obj);
        this.reloadData();
      }
    },

    removeSearchText: function(searchText){
      if (searchText) {
        var search = this.get('searchCriterias.search');
        var searchObj = search.filter(function(el){
          return el.text === searchText.text;
        });
        search.removeObjects(searchObj);
        if (search.length === 0)
        {
          this.set('flagAppliedSearchRemoved',true);
        }
        this.reloadData();
      }
    },

    removeCategoryItem: function(categoryObject){
      if (categoryObject && categoryObject.id) {
        var sc = this.get('searchCriterias.categories');
        var ac = sc.filter(function(el){
          return el.id === categoryObject.id;
        });
        sc.removeObjects(ac);
        if (sc.length === 0)
        {
          this.set('flagAppliedCategoriesRemoved',true);
        }
        this.reloadData();
      }
    },

    removeFilterItem: function(filterObject){
      var filter;
      if (filterObject.linkedFilterId){ //is subfilter
        filter = this.store.getById('filter-item', filterObject.linkedFilterId);
        filter.deleteRecord();
      } else {
        filter = this.store.getById('filter-item', filterObject.id);
        filter.set('removeItem',true);
        filter.resetFilter();
      }
      var appliedFilters = this.get('displayedCriterias.filters');
      var appliedFilter = appliedFilters.findBy('id', filterObject.id);
      appliedFilters.removeObject(appliedFilter);
      if (appliedFilters.length === 0) {
        this.set('flagAppliedFilterRemoved',true);
      }
      this.reloadData();
    },

    sortFilters: function(filterDisplay){
      var filters = this.get('model.filters');
      var id = filterDisplay.id;
      var selectedFilter;
      filters.forEach(function(groupFilters){
        groupFilters.get('items').content.forEach(function(filter){
          if(filter.get('id') !== id){
            filter.set('sortOrder','off');
          } else {
            selectedFilter = filter;
          }
          filter.get('linkedFilterItems').content.forEach(function(lf){
            if (lf.get('id') !== id){
              lf.set('sortOrder','off');
          } else {
            selectedFilter = filter;
          }
          });
        });
      });
      selectedFilter.switchsortOrder();

      var type, order;
      var filterName = selectedFilter.get('name');
      order = selectedFilter.get('sortOrder');
      switch(filterName){
        case 'price':
          type = filterName;
          break;
        case 'salesByQty':
          type = 'sales';
          break;
        case 'returnPercent':
          type = 'returns';
          break;
        case 'invAvailable':
          type = 'available';
          break;
      }
      if (type && order !== 'off' && !selectedFilter.get('relations') ) {
        this.set('currentSort', {'type':type,'order':order});
      } else {
        this.set('currentSort', '');
      }

      /* Controller reload */
      this.reloadData();
    },

    showClearFiltersRequest: function(){
      this.set('confirmMessage', 'Do You Want To Clear All Filters?');
      this.set('confirmApplyCallbackName', 'clearAllFilters');
      this.send('openModal', 'modal-confirm');
    },

    clearAllFilters: function(){
      var state = {
        'categories': [],
        'search': [],
        'sortType': '',
        'displayMode': 'big',
        'filters': []
      };
      this.set('confirmMessage', '');
      this.set('confirmApplyCallbackName', '');
      this.send('closeModal', 'modal-confirm');
      this.applyState(state);
    },

    closeConfirmView: function() {
      this.set('confirmMessage', '');
      this.set('confirmApplyCallbackName', '');
      this.send('closeModal', 'modal-confirm');
    },

    showMoreCategories: function(category) {
      category.get('items').content.forEach(function (cat) {
        var weight = cat.get('weight');
        cat.set('weight',weight+1);
      });
      category.set('hasMoreProperty',false);
      category.set('hasLessProperty',true);
    },

    showLessCategories: function(category) {
      category.get('items').content.forEach(function (cat) {
        var weight = cat.get('weight');
        cat.set('weight',weight-1);
      });
      category.set('hasMoreProperty',true);
      category.set('hasLessProperty',false);
    }
  },

  setTextList: function(textList) {
    var search = [{
      'text' : textList[0],
      'searchBy' : this.get('currentSearchType') ? this.get('currentSearchType'):'all'
    }];
    var searchCriterias =  {
      'search' : search,
      'categories'     : [],
      'filters'        : [],
    };
    // this.set('filters',[]); //TODO reset all filters
    var state = {
      'categories': [],
      'search': search,
      'sortType' : {'order': 'desc', 'type': '_score'},
      'filters': []
    };
    this.set('confirmMessage', '');
    this.set('confirmApplyCallbackName', '');
    this.set('searchCriterias',searchCriterias);
    this.applyState(state);
  },

  applyState: function(appliedState) {
    // var appliedState = {
    //   filters:
    //   categories:
    //   search:
    //   sortType:
    // };

    var model = this.get('model');
    /* Set Categories */
    var categories = model.get('data.categories');
    var cats = this.fillCategories(categories, appliedState.categories);

    /* Set searchFilters */
    var filters = model.get('data.filters');
    var flts = this.fillFilters(filters, appliedState.filters);
    this.set('productSearchText', '');
    this.set('resultsSearchText', '');

    this.set('searchCriterias.filters', appliedState.filters);
    this.set('appliedFiltersForSave', appliedState.filters);
    var flagAppliedFilterRemoved, flagAppliedCategoriesRemoved,
        flagAppliedSearchRemoved;
    if (appliedState.filters.length === 0){
      flagAppliedFilterRemoved = true;
    }
    this.set('displayedCriterias.filters', flts.displayedFilters);

    this.set('searchCriterias.categories', appliedState.categories);
    this.set('displayedCriterias.categories', cats.displayedCategories);
    if (appliedState.categories.length === 0){
      flagAppliedCategoriesRemoved = true;
    }
    var dictionaries = model.get('data.dictionaries');
    this.set('dictionaries', dictionaries);

    this.set('productCount', model.get('data.productCount'));

    this.set('searchCriterias.search', appliedState.search);
    if (!appliedState.search.text || appliedState.search.text.length === 0){
      flagAppliedSearchRemoved = true;
    }
    this.set('displayedCriterias.search', appliedState.search);
    this.set('currentSearchType', appliedState.search.searchBy);
    this.set('currentSort', appliedState.sortType || '');
    var showSelected = this.get('showSelected');
    this.transitionToRoute('search-criterias.products', JSON.stringify({
      'appliedCategories': appliedState.categories,
      'search': appliedState.search,
      'sortType': appliedState.sortType,
      'appliedFilters': appliedState.filters,
      'flagAppliedFilterRemoved': flagAppliedFilterRemoved,
      'flagAppliedSearchRemoved': flagAppliedSearchRemoved,
      'flagAppliedCategoriesRemoved': flagAppliedCategoriesRemoved,
      'showSelected': showSelected
    }));
  },

  fillCategories: function(categories, appliedCategories) {
    var displayedCategories = Em.A();
    if (categories) {
      categories.forEach(function (cat) {
        cat.get('items').content.forEach(function (item) {
          var ac = appliedCategories.filter(function(el){
            return el.id === item.id;
          });
          var isChecked = ac.length > 0;
          var mode = (isChecked) ? ac[0].mode : undefined;
          item.set('mode', mode);
          if (isChecked) {
            var catItem = {
              id: item.id,
              title: item.get('title'),
              mode: mode,
              catId: cat.id
            };
            displayedCategories.push(catItem);
          }
        });
      });
    }
    return {categories: categories, displayedCategories: displayedCategories};
  },

  fillFilters: function(filters, appliedFilters) {
    var displayedFilters = Em.A();
    var dictionaries = this.get('dictionaries');
    filters.forEach(function(filterCategory){
      filterCategory.get('items').content.forEach(function(filter){
        var removeSubfilters = true;
        filter.resetFilter(removeSubfilters);
        var name = filter.get('name');
        var appliedFilter = appliedFilters[name];
        if (appliedFilter) {
          var mode  = appliedFilter.mode;
          var sorting = filter.get('sorting');
          filter.set('filterMode', mode);
          filter.set('textFields', Em.copy(appliedFilter.textFields, true));
          filter.set('relations', appliedFilter.relations);
          filter.set('dateRange', appliedFilter.dateRange);
          var title = filter.getFullTitle();
          var relations = appliedFilter.relations;
          if (relations){
            for (var i in appliedFilter.relations){
              title += ' ('+ appliedFilter.relations[i] +')';
            }
          }
          if (sorting){
            var sortOrder  = appliedFilter.sortOrder;
            filter.set('sorting', sorting);
            filter.set('sortOrder',sortOrder);
          }
          if (filter.isEnabled() && filter.get('isGlobal') !== true) {
            var dictionaryName = filter.get('dictionary');
            if (dictionaryName && dictionaries.hasOwnProperty(dictionaryName)) {
              displayedFilters.push(filter.getDisplayObject(dictionaries[dictionaryName]));
            } else {
              displayedFilters.push(filter.getDisplayObject());
            }
          }
          if (appliedFilter.linkedFilters) {
            appliedFilter.linkedFilters.forEach(function(linkedFilter){
              var keys = {};
              if (linkedFilter.dateRange) {
                keys.dateRange = linkedFilter.dateRange;
              }
              title = '';
              if (linkedFilter.relations) {
                keys.relations = linkedFilter.relations;
                for (var i in linkedFilter.relations){
                  title += ' ('+ linkedFilter.relations[i] +')';
                }
              }
              if (linkedFilter.sortOrder){
                keys.sortOrder = linkedFilter.sortOrder;
              }
              var lf = filter.addLinkedFilter(linkedFilter.textFields, keys);
              lf.set('filterMode', linkedFilter.mode);
              if (lf.isEnabled()) {
                var dictionaryName = lf.get('dictionary');
                if (dictionaryName && dictionaries.hasOwnProperty(dictionaryName)) {
                  displayedFilters.push(lf.getDisplayObject(dictionaries[dictionaryName]));
                } else {
                  displayedFilters.push(lf.getDisplayObject());
                }
              }
            });
          }
        }
      });
    });
    return {filters: filters, displayedFilters: displayedFilters};
  },

  reloadData: function() {
    var that = this;
    that.set('isDataRefreshing', true);
    Ember.Logger.warn('IsDataRefreshing = true; Gonna transite');
      //TODO: Need to update displayedCriterias and data for TransitionToRoute
      var search = that.get('searchCriterias.search');
      var sc = that.get('searchCriterias.categories');
      var sortType = that.get('currentSort');
      var filterCategories = that.get('filters');
      var appliedFilters = {};
      var displayedFilters = Em.A();
      var displayedCategories = Em.A();
      var emptyFilterHasLinkedFilters = false;

      var categories = that.get('model.categories');
      categories.forEach(function (cat) {
        cat.get('items').content.forEach(function (item) {
          var ac = sc.filter(function(el){
            return el.id === item.id;
          });
          var isChecked = ac.length > 0;
          var mode = (isChecked) ? ac[0].mode : undefined;
          item.set('mode', mode);
          if (isChecked) {
            var catItem = {
              id: item.id,
              title: item.get('title'),
              mode: mode,
              catId: cat.id
            };
            displayedCategories.push(catItem);
          }
        });
      });
      var dictionaries = that.get('dictionaries');
      filterCategories.forEach(function(filters){
        filters.get('items').content.forEach(function(filter){
          var linkedFilters = filter.get('linkedFilterItems').content;
          if (filter.get('removeItem') && linkedFilters.length > 0)
          {
            filter.set('name',linkedFilters[0].get('name'));
            filter.set('textFields',linkedFilters[0].get('textFields'));
            filter.set('filterMode',linkedFilters[0].get('filterMode'));
            filter.set('dateRange',linkedFilters[0].get('dateRange'));
            filter.set('relations',linkedFilters[0].get('relations'));
            filter.set('removeItem',undefined);
            var first = that.store.getById('filter-item', linkedFilters[0].get('id'));
            first.deleteRecord();
            emptyFilterHasLinkedFilters = true;
          }
          var name = filter.get('name');
          var textFields = filter.get('textFields');
          var filterMode = filter.get('filterMode');
          if (!filter.isFilled()) {
            filter.set('filterMode','off');
          }
          var af = {
            name: name,
            textFields: textFields,
            mode: filterMode
          };
          if (filter.isEnabled() && filter.get('isGlobal') !== true) {
            var dictionaryName = filter.get('dictionary');
            if (dictionaryName && dictionaries.hasOwnProperty(dictionaryName)) {
              displayedFilters.push(filter.getDisplayObject(dictionaries[dictionaryName]));
            } else {
              displayedFilters.push(filter.getDisplayObject());
            }
          }

          var afDataRange = filter.get('dateRange');
          if (afDataRange != null)
            {
              af.dateRange = afDataRange;
            }
            var afRelations = filter.get('relations');
            if (afRelations != null)
              {
                af.relations = afRelations;
              }
              var sortOrder = filter.get('sortOrder');
              if (sortOrder)
                {
                  af.sortOrder = sortOrder;
                }
                if (linkedFilters.length) {
                  var lfList = [];
                  linkedFilters.forEach(function(linkedFilter) {
                    if (linkedFilter.isEnabled()) {
                      var obj = {
                        title: linkedFilter.get('title'),
                        name: linkedFilter.get('name'),
                        textFields: linkedFilter.get('textFields'),
                        dateRange: linkedFilter.get('dateRange'),
                        relations: linkedFilter.get('relations'),
                        mode: linkedFilter.get('filterMode')
                      };
                      sortOrder = linkedFilter.get('sortOrder');
                      if (sortOrder)
                        {
                          obj.sortOrder = sortOrder;
                        }
                        lfList.push(obj);

                        var dictionaryName = linkedFilter.get('dictionary');
                        if (dictionaryName && dictionaries.hasOwnProperty(dictionaryName)) {
                          displayedFilters.push(linkedFilter.getDisplayObject(dictionaries[dictionaryName]));
                        } else {
                          displayedFilters.push(linkedFilter.getDisplayObject());
                        }
                    }
                  });
                  if (lfList.length) {
                    af.linkedFilters = lfList;
                  }
                }
                if (filter.get('isGlobal')) {
                  if (textFields.length === 0 || (textFields.length > 0 && textFields[0].value)) {
                    appliedFilters[af.name] = af;
                  }
                }
                else if ((af.linkedFilters != null) || (filter.isEnabled())) {
                  appliedFilters[af.name] = af;
                }
        });
      });

      that.set('displayedCriterias.search', search);
      that.set('displayedCriterias.filters', displayedFilters);
      that.set('displayedCriterias.categories', displayedCategories);
      that.set('appliedFiltersForSave', appliedFilters);

      var flagAppliedFilterRemoved = that.get('flagAppliedFilterRemoved');
      var flagAppliedSearchRemoved = that.get('flagAppliedSearchRemoved');
      var flagAppliedCategoriesRemoved = that.get('flagAppliedCategoriesRemoved');
      that.set('flagAppliedFilterRemoved',undefined);
      that.set('flagAppliedSearchRemoved',undefined);
      that.set('flagAppliedCategoriesRemoved',undefined);
      var showSelected = that.get('showSelected');
      that.set('isDataRefreshing', false);
      if (emptyFilterHasLinkedFilters) {
        var state = {
          'categories': Em.copy(sc,true),
          'search': search,
          'sortType': sortType,
          'filters': Em.copy(appliedFilters,true),
        };
        that.applyState(state);
      } else {
          that.transitionToRoute('search-criterias.products', JSON.stringify({
           'appliedCategories': sc,
           'search': search,
           'sortType': sortType,
           'appliedFilters': appliedFilters,
           'flagAppliedFilterRemoved': flagAppliedFilterRemoved,
           'flagAppliedSearchRemoved': flagAppliedSearchRemoved,
           'flagAppliedCategoriesRemoved': flagAppliedCategoriesRemoved,
          }));
       }
  },
});
