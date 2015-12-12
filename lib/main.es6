import {ComponentRegistry} from 'nylas-exports';

import GifPicker from './gif-picker';

module.exports = {
  activate(state = {}) {
    this.state = state;
    ComponentRegistry.register(GifPicker, {role: 'Composer:ActionButton'});
  },

  deactivate() {
    ComponentRegistry.unregister(GifPicker);
  },

  serialize() {}
};
