var SearchCriterias = Ember.View.extend( {
  click: function(event) {
    if (this.get('controller').get('popupOpened') === true) {
      Ember.Instrumentation.instrument('windowClicked', event.target);
    }
  },
});

export default SearchCriterias;
