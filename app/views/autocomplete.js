import UIWidgetMixin from 'app/mixins/jquery-ui';

export default Ember.TextField.extend(UIWidgetMixin, {
	tagName:'input',
  uiType: 'autocomplete',
  uiOptions: ['disabled','autoFocus','delay','minLength','position','source'],
});
