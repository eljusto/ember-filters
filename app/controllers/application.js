/*global App:false */
export default Ember.ObjectController.extend({
  isLoading: false,

  actions: {
    startLoading: function() {
      this.set('isLoading', true);
    },
    stopLoading: function() {
      //TODO: probably we'll need to set a queue and set isLoading=false if the queue would be EMPTY
      this.set('isLoading', false);
    }
  }
});
