import React, { PropTypes } from 'react'
import $ from 'jquery'
import _ from 'lodash';
import classnames from 'classnames';
import { DETECTION_TAB } from '../../redux/modules/media/mediaData'
import {getClearWordFromTranscript} from '../../common/Common';

export class Transcript extends React.Component {
  static propTypes = {
    mediaId: PropTypes.string.isRequired,
    playerState: PropTypes.object.isRequired,
    mediaState: PropTypes.object.isRequired,
    markersState: PropTypes.object,
    actions: PropTypes.object.isRequired
  };

  transcriptHighlight = 10;
  isHoverTranscript = false;

  constructor(props) {
    super(props);
    this.state = {hoverUtterance: null};
  }

  componentDidUpdate() {
    if (this.refs.current && !this.isHoverTranscript) {
      let $transcriptDom = $(this.refs.transcript);
      let $current = $(this.refs.current);
      let scrollTop = $current.offset().top - $transcriptDom.offset().top + $transcriptDom.scrollTop() - ($transcriptDom.height()) / 2;
      $transcriptDom.animate({
        scrollTop: scrollTop
      }, 300);
    }
  }

  onHoverTranscript() {
    this.isHoverTranscript = true;
  }

  onBlurTranscript() {
    this.isHoverTranscript = false;
  }

  findDetectionSegment(start) {
    let utterances = this.props.mediaState.utterances;
    let findUtterance = null;
    for (let id of utterances.itemIds) {
      let utterance = utterances.items[id];
      let res = _.findIndex(utterance.segments, segment => start > segment.s && start < segment.e)
      if (res > -1) {
        findUtterance = {...utterance, segmentIndex: res};
        break;
      }
    }
    return findUtterance;
  }

  onHoverDetectionSegment(utterance) {
    if (utterance) {
      console.log(utterance);
      this.setState({hoverUtterance: utterance});
    }
  }

  onBlurDetectionSegment() {
    this.setState({hoverUtterance: null});
  }

  render() {
    let mediaState = this.props.mediaState;
    let playerState = this.props.playerState;
    let markersState = this.props.markersState;
    let transcript = mediaState.transcript;

    let time = playerState.duration * playerState.played;
    // Calculate current bounds
    let bottomHighlightBound = parseInt(time / this.transcriptHighlight, 10) * this.transcriptHighlight;
    let topHighlightBound = bottomHighlightBound + this.transcriptHighlight;
    let currentWordsCounter = 0;

    // Prepare markers highlight
    let markers = {};
    if (markersState) {
      markersState.markerIds.forEach(markerId => {
        let marker = markersState.markers[markerId];
        markers[marker.time * 1000] = marker;
      });
    }

    return (
      <div className="listing__transcript">
        <div className="listing__transcript__content" ref="transcript" onMouseEnter={this.onHoverTranscript.bind(this)} onMouseLeave={this.onBlurTranscript.bind(this)}>
          {
            transcript.wordIds.map((wordId, i) => {
              let word = transcript.words[wordId];
              let wordTimeInSec = word.s / 1000;
              let wordStyle = {};

              // highlight for current position of playing
              let isCurrent = (wordTimeInSec > bottomHighlightBound && wordTimeInSec < topHighlightBound);
              currentWordsCounter = (isCurrent) ? currentWordsCounter + 1 : currentWordsCounter;

              // hightlight for keywords
              let isFindingKeyword = (markers[word.s]);

              // highlight speaker
              let isSpeaker = (word.m && word.m === 'turn');
              if (isSpeaker) {
                let speakerName = getClearWordFromTranscript(word.w);
                let speaker = mediaState.speakers[speakerName];
                let speakerColor = (speaker) ? speaker.color : null;
                wordStyle['color'] = speakerColor;
              }

              // highlight utterances phrase
              let utterance = null;
              if (mediaState.view.activeTab === DETECTION_TAB) {
                utterance = this.findDetectionSegment(word.s);
                if (utterance && !isSpeaker) {
                  if (this.state.hoverUtterance &&
                      utterance.id === this.state.hoverUtterance.id &&
                      utterance.segmentIndex === this.state.hoverUtterance.segmentIndex)
                  {
                    wordStyle['color'] = '#fff';
                    wordStyle['backgroundColor'] = utterance.color;
                  }
                  else {
                    wordStyle['color'] = utterance.color;
                    wordStyle['backgroundColor'] = 'inherit';
                  }
                }
              }

              let highlightClass = classnames({
                current: isCurrent,
                'highlighted': isFindingKeyword || isSpeaker || utterance,
                'green': isFindingKeyword
              });

              return (
                <span key={'word-' + i}
                      className={highlightClass}
                      style={wordStyle}
                      ref={currentWordsCounter === 1 ? 'current' : null}
                      onMouseEnter={this.onHoverDetectionSegment.bind(this, utterance)}
                      onMouseLeave={this.onBlurDetectionSegment.bind(this)}
                >
                  {(word.m === 'punc') ? word.w : ' ' + word.w}
                </span>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Transcript
