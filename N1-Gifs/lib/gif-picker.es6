import {DraftStore, QuotedHTMLParser, Utils, DOMUtils, React, ComposerExtension} from 'nylas-exports';
import {Popover} from 'nylas-component-kit';
let rangy = require('rangy');

// Using Giphy testing key for now
let giphy = require('giphy-api')('dc6zaTOxFJmzC');

class GifSaveState extends ComposerExtension {
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

class GifPicker extends React.Component {
  static displayName = 'GifPicker';

  static innerPropTypes = {
    selection: React.PropTypes.object
  };

  static containerStyles = {order: 2};

  render() {
    const button = (
      <button className="btn btn-toolbar narrow">
        Gif it!
      </button>
    );

    return (
      <Popover ref="popover" className="gif-picker" buttonComponent={button}>
        <GifBox></GifBox>
      </Popover>
    );
  }
}

// Indivigual gif
let Gif = React.createClass({
  chooseGif: function(event) {
    let gifUrl = this.props.gifUrl;
    let gifElem = '<span><img src="' + gifUrl + '"></span>';
    let elem = document.getElementsByClassName('contenteditable')[0];

    let sel = window.getSelection();
    let marker = document.getElementById('n1-gif-marker');
    sel.setBaseAndExtent(marker, 0, marker, 0);
    document.execCommand('insertHTML', true, gifElem);
    elem.focus();
  },
  getStyles: function() {
    return {
      backgroundImage: 'url(' + this.props.gifUrl + ')'
    };
  },
  render: function() {
    return (
      <div className="gif" gifUrl={this.props.gifUrl} onMouseDown={this.chooseGif}>
        <img style={this.getStyles()}/>
      </div>
    );
  }
});

// Collection of all gifs in a category
let GifList = React.createClass({
  render: function() {
    let self = this;
    let gifNodes = this.props.data.map(function(gif) {
      return (
        <Gif gifUrl={gif.images.fixed_height_small.url} key={gif.id}></Gif>
      );
    });
    return (
      <div className="gifList">
        {gifNodes}
      </div>
    );
  }
});

// Container
let GifBox = React.createClass({
  getInitialState: function() {
    return {
      gifs: [],
      value: ''
    };
  },
  componentDidMount: function() {
    // Load trending to start off with
    giphy.trending(function(err, results) {
      if (!err) {
        this.setState({gifs: results.data});
      }
    }.bind(this));
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  handleKeyDown: function(event) {
    if (event.key === 'Enter') {
      this.searchGifs();
    }
  },
  searchGifs: function() {
    // Search gifs with specific keyword
    giphy.search(this.state.value, function(err, results) {
      if (!err) {
        this.setState({gifs: results.data});
      }
    }.bind(this));
  },
  render: function() {
    let value = this.state.value;
    return (
      <div className="gifBox">
        <h4>Search Gifs</h4>
        <a href="http://giphy.com"><small>Powered by Giphy</small></a>
        <input type="text" placeholder="Kittens, rofl" value={value} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/>
        <GifList data={this.state.gifs}></GifList>
      </div>
    );
  }
});

export {GifSaveState, GifPicker};
