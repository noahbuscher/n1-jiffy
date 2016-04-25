import {ComponentRegistry, ExtensionRegistry} from 'nylas-exports';

import {GifSaveState, GifPicker} from './gif-picker';

module.exports = {
  activate(state = {}) {
    this.state = state;
    ComponentRegistry.register(GifPicker, {role: 'Composer:ActionButton'});
    ExtensionRegistry.Composer.register(GifSaveState);
  },

  deactivate() {
    ComponentRegistry.unregister(GifPicker);
    ExtensionRegistry.Composer.unregister(GifSaveState);
  },

  serialize() {
    return this.state;
  }
};
