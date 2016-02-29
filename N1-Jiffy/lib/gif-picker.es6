import {DraftStore, QuotedHTMLParser, Utils, DOMUtils, React, ComposerExtension} from 'nylas-exports';
import {Popover} from 'nylas-component-kit';

// Using Giphy testing key for now
let giphy = require('giphy-api')('dc6zaTOxFJmzC');

export class GifSaveState extends ComposerExtension {
  static onBlur(editableNode, range, event) {
    let elem = document.getElementsByClassName('contenteditable')[0];

    if (document.getElementById('n1-gif-marker') !== null) {
      var markerOld = document.getElementById('n1-gif-marker');
      markerOld.outerHTML = '';
      delete markerOld;
    }

    let r = document.createRange();
    r.setStart(range.anchorNode, range.anchorOffset);
    r.setEnd(range.anchorNode, range.anchorOffset);
    let marker = document.createElement('span');
    marker.id = 'n1-gif-marker';
    r.insertNode(marker);
  }

  static onFocus(editableNode, range, event) {
    let elem = document.getElementsByClassName('contenteditable')[0];

    if (document.getElementById('n1-gif-marker') !== null) {
      var markerOld = document.getElementById('n1-gif-marker');
      markerOld.outerHTML = '';
      delete markerOld;
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

    this.closePopover = this.closePopover.bind(this);3
    this.render = this.render.bind(this);
  }

  closePopover() {
    this.refs.popover.close();
  }

  render() {
    const button = (
      <button className="btn btn-toolbar narrow">
        Gif it!
      </button>
    );

    return (
      <Popover ref="popover" className="gif-picker" buttonComponent={button}>
        <GifBox closePopover={this.closePopover} />
      </Popover>
    );
  }
}

// Indivigual gif
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

    let sel = window.getSelection();
    let marker = document.getElementById('n1-gif-marker');
    sel.setBaseAndExtent(marker, 0, marker, 0);
    document.execCommand('insertHTML', true, gifElem);
    elem.focus();
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
