import {DraftStore, QuotedHTMLParser, React} from 'nylas-exports';
import {Popover} from 'nylas-component-kit';

// Using Giphy testing key for now
var giphy = require('giphy-api')('dc6zaTOxFJmzC');

class GifPicker extends React.Component {
  static displayName = 'GifPicker';

  static propTypes = {
    draftClientId: React.PropTypes.string.isRequired
  }

  render() {
    const button = (
      <button className="btn btn-toolbar narrow">
        Gif it!
      </button>
    );

    return (
      <Popover ref="popover" className="gif-picker pull-right" buttonComponent={button}>
        <GifBox draftClientId={this.props.draftClientId}></GifBox>
      </Popover>
    );
  }
}

// Indivigual gif
var Gif = React.createClass({
  chooseGif: function(event) {
    var gifUrl = this.props.gifUrl;

    DraftStore.sessionForClientId(this.props.draftClientId).then(function(session) {
      let gifImg = '<img src="' + gifUrl + '"/>';
      let draftHtml = QuotedHTMLParser.appendQuotedHTML(gifImg, session.draft().body);
      session.changes.add({body: draftHtml});
    });
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
var GifList = React.createClass({
  render: function() {
    var self = this;
    var gifNodes = this.props.data.map(function(gif) {
      return (
        <Gif gifUrl={gif.images.fixed_height_small.url} key={gif.id} draftClientId={self.props.draftClientId}></Gif>
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
var GifBox = React.createClass({
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
    var value = this.state.value;
    return (
      <div className="gifBox">
        <h4>Search Gifs</h4>
        <small>Powered by Giphy</small>
        <input type="text" placeholder="Kittens, rofl" value={value} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/>
        <GifList data={this.state.gifs} draftClientId={this.props.draftClientId}></GifList>
      </div>
    );
  }
});

export default GifPicker;
