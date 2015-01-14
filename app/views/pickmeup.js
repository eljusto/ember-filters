import PickMeUpMixin from 'app/mixins/pickmeup';

export default Em.TextField.extend(PickMeUpMixin, {
      attributeBindings: ['name'],
});

