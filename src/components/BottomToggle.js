import React from 'react'

class BottomToggle extends React.Component {
  render() {
    return (
      <section id="list-toggler">
        <div className="toggle-container">
          <div className="toggle-list">
            <div className="button-wrapper">
              <button id="list-toggle"
                className={ this.props.isListOpen? 'open-map': 'open-list'}
                onClick={(e) => this.props.toggleClassName(e) }
                aria-label={this.props.isListOpen? 'Showing List': 'Showing Map'}
                aria-expanded={this.props.isListOpen? 'true' : 'false'}
              >
                {this.props.isListOpen? 'show map' : 'show places'}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default BottomToggle
