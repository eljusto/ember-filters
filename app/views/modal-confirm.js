import ModalView from 'app/views/modal-view';

var ModalConfirm = ModalView.extend({
  templateName: 'modal-confirm',
  messageText: '',
  applyCallbackName: '',
  init:function () {
    this._super();
  },

  didInsertElement: function() {
    this._super();
    var controller = this.get('controller');
    var confirmMessage = controller.get('confirmMessage');
    this.set('messageText', confirmMessage);
    var applyCallbackName = controller.get('confirmApplyCallbackName');
    this.set('applyCallbackName', applyCallbackName);
  },

  actions: {
    yesButtonPressed: function() {
      var controller = this.get('controller');
      var applyCallbackName = this.get('applyCallbackName');
      if (applyCallbackName && applyCallbackName !== '') {
        controller.send(applyCallbackName);
      }
    },
    cancelButtonPressed: function() {
      var controller = this.get('controller');
      controller.send('closeConfirmView');
    }
  },
});

export default ModalConfirm;
