import React from 'react';
import PBFS from '../imgs/Powered-by-Foursquare-black-300.png';
import ListItem from './ListItem'


class ListComponent extends React.Component {


  render() {
      let {filterResults, onMobile, isPanelOpen, isListOpen, isMarkerActive, userSelectedLI, isOnline, fetchError, errorMsg} = this.props
    return (
      <section id="listComponent">
        <aside
          className={'listbox '+ (onMobile? (isListOpen? 'show-list' : 'hide-list') : (isPanelOpen ? 'show-panel' : 'hide-panel'))}
          id="listbox"
        >

          <button
            id="toggle-panel"
            className={isPanelOpen ? 'panel-open' : 'panel-closed'}
            onClick={ (e) => this.props.toggleClassName(e)  }
            aria-label={isPanelOpen? 'Collapse side panel': 'Expand side panel'}
            aria-expanded={isPanelOpen? 'true' : 'false'}
            alt={isPanelOpen? 'Collapse side panel': 'Expand side panel'}
            title={isPanelOpen? 'Collapse side panel': 'Expand side panel'}
          >
          </button>

          <div className="list-overflow">
            <div className="list-top-spacer"></div>

            <ListItem
              filterResults={filterResults}
              getListId={this.props.getListId}
              onMobile={onMobile}
              isMarkerActive={isMarkerActive}
              userSelectedLI={userSelectedLI}
            />

            <div className="list-bottom-spacer">
              <img
                src={PBFS}
                alt="Powered by Foursquare"
                title='Powered by Foursquare'
              />
            </div>
            <p className="connectionStatus">{isOnline? '': 'No internet connection found. App is running in offline mode.'}</p>
            <p className="errorMessage">{fetchError? errorMsg: ''}</p>

          </div>
        </aside>
      </section>
    )
  }
}

export default ListComponent
