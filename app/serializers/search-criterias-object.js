export default DS.RESTSerializer.extend( {
extractFind: function(store, type, payload) {

    var searchResult = payload['search-criterias-object'];
    var categories = searchResult.categories;
    var categoryItems = [];
    var catIds = [];
    categories.forEach(function(category){
      var itemIds = [];
      catIds.push(category.id);
      category.items.forEach(function(item){
        categoryItems.push(item);
        item.category = category.id;
        itemIds.push(item.id);
      });
      category.items = itemIds;
    });
    searchResult.categories = catIds;

    var filters = searchResult.filters;
    var filterItems = [];
    var filterIds = [];
    if (filters) {
      filters.forEach(function(filter){
        var filterItemIds = [];
        filterIds.push(filter.id);
        filter.items.forEach(function(item){
          item.id = Em.guidFor(item);
          filterItems.push(item);
          filterItemIds.push(item.id);

          if (item.linkedFilterItems) {
            var linkedFilterIds = [];
            item.linkedFilterItems.forEach(function(lf) {
            lf.id = Em.guidFor(lf);
            linkedFilterIds.push(lf.id);
            filterItems.push(lf);
            });
            item.linkedFilterItems = linkedFilterIds;
          }
        });
        filter.items = filterItemIds;
      });
    } else {
      filters = [];
    }
    searchResult.filters = filterIds;
    payload['category'] = categories;
    payload['category-item'] = categoryItems;
    payload['filter'] = filters;
    payload['filter-item'] = filterItems;
    payload['search-criterias-object'] = [searchResult];

    return this._super(store, type, payload);
}
});
