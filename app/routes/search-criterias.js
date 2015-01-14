export default Ember.Route.extend({
  searchCriterias: {},

  model: function (params, transition) {
    if (params && params.searchCriterias) {
      this.set('searchCriterias', JSON.parse(params.searchCriterias));
    } else {
      this.set('searchCriterias', {});
    }
    this.store.unloadAll('search-criterias-object');
    return this.store.find('search-criterias-object', 1).then(function (results) {
      return results;
    });
  },

  setupController: function (controller, model) {
    var searchCriterias = this.get('searchCriterias');
    var appliedFilters;
    var appliedCategories;
    var appliedSearch;
    var appliedSort;

    if (searchCriterias.appliedFilters) {
      appliedFilters = searchCriterias.appliedFilters;
    } else {
      appliedFilters = model.get('data.appliedState.filters');
    }

    if (searchCriterias.appliedCategories) {
      appliedCategories = searchCriterias.appliedCategories;
    } else {
      appliedCategories = model.get('data.appliedState.categories');
    }

    if (searchCriterias.search) {
      appliedSearch = searchCriterias.search;
    } else {
      appliedSearch = model.get('data.appliedState.search');
    }

    if (searchCriterias.sortType) {
      appliedSort = searchCriterias.sortType;
    } else {
      appliedSort = model.get('data.appliedState.sortType');
    }

    var appliedState = {
      filters:    ( appliedFilters || [] ),
      categories: ( appliedCategories || [] ),
      search:     ( appliedSearch || [] ),
      sortType:   ( appliedSort || [] ),
    };
    controller.set('model', model);
    controller.applyState(appliedState);

    controller.set('isDataRefreshing', false);
  },

  actions: {
    openModal: function(modalName) {
      return this.render(modalName, {
        into: 'search-criterias',
        outlet: modalName
      });
    },

    closeModal: function(modalName) {
      return this.disconnectOutlet({
        outlet: modalName,
        parentView: 'search-criterias'
      });
    }
  }

});
