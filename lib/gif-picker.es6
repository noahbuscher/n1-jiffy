import {DraftStore,
  QuotedHTMLParser,
  Utils,
  DOMUtils,
  React,
  ReactDOM,
  Actions,
  ComposerExtension} from 'nylas-exports';
import {Popover, RetinaImg} from 'nylas-component-kit';

// Using Giphy testing key for now
let giphy = require('giphy-api')('dc6zaTOxFJmzC');

export class GifSaveState extends ComposerExtension {
  static sel = null;
  static onBlur({editor, event}) {
    // Save the current selection when focus is lost
    GifSaveState.sel = editor.currentSelection().exportSelection()
  }

  static onFocus({editor, event}) {
    // If we have a saved selection, restore and clear it
    // when contenteditable is focused
    if(GifSaveState.sel) {
      editor.select(GifSaveState.sel);
      GifSaveState.sel = null;
    }
  }
}

export class GifPicker extends React.Component {
  static displayName = 'GifPicker';

  static innerPropTypes = {
    selection: React.PropTypes.object
  };

  static containerStyles = {order: 2};

  constructor(props) {
    super(props);
    this.render = this.render.bind(this);
  }

  onClick = ()=> {
    const buttonRect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    Actions.openPopover(
      <GifBox />,
      {originRect: buttonRect, direction: 'up'}
    );
  }

  render() {
    return (
      <button
        tabIndex={-1}
        className="btn btn-toolbar narrow"
        title="Insert gif…"
        onClick={this.onClick}>
        <RetinaImg url="nylas://N1-Jiffy/assets/icon-composer-jiffy@2x.png" mode={RetinaImg.Mode.ContentIsMask}/>
      </button>
    );
  }
}

// Individual gif
class Gif extends React.Component {
  static displayName = 'Gif';

  constructor(props) {
    super(props);

    this.chooseGif = this.chooseGif.bind(this);
    this.render = this.render.bind(this);
  }

  chooseGif(event) {
    let gifUrl = this.props.gifUrl;
    let gifElem = `<span><img src="${ gifUrl }"></span>`;
    let elem = document.getElementsByClassName('contenteditable')[0];

    elem.focus();
    document.execCommand('insertHTML', true, gifElem);
  }

  render() {
    return (
      <div className="gif" onMouseDown={this.chooseGif}>
        <span style={{backgroundImage: `url(${ this.props.gifUrl })`}} />
      </div>
    );
  }
}

// Collection of all gifs in a category
class GifList extends React.Component {
  static displayName = 'GifList';

  constructor(props) {
    super(props);

    this.render = this.render.bind(this);
  }

  render() {
    let gifNodes = this.props.data.map((gif) => {
      return (
        <Gif gifUrl={gif.images.fixed_height_small.url} key={gif.id} />
      );
    });
    return (
      <div className="gif-content-container">
        {gifNodes}
      </div>
    );
  }
}

// Container
class GifBox extends React.Component {
  constructor(props) {
    super(props);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.searchGifs = this.searchGifs.bind(this);
    this.render = this.render.bind(this);

    this.state = {
      gifs: [],
      value: ''
    };
  }

  componentDidMount() {
    // Load trending to start off with
    giphy.trending((err, results) => {
      if (!err) {
        this.setState({gifs: results.data});
      } else {
        console.error(err);
      }
    });
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.searchGifs();
    }
  }

  searchGifs() {
    // Search gifs with specific keyword
    giphy.search(this.state.value, (err, results) => {
      if (!err) {
        this.setState({gifs: results.data});
      } else {
        console.error(err);
      }
    });
  }

  render() {
    let value = this.state.value;
    return (
      <div className="gif-menu">
        <div className="gif-header-container">
          <input
            type="text"
            className="search"
            tabIndex="1"
            placeholder="Kittens, rofl"
            value={value}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
          />
        </div>
        <GifList data={this.state.gifs}></GifList>
        <div className="gif-footer-container">
          <a href="http://giphy.com">Powered by Giphy</a>
        </div>
      </div>
    );
  }
}
