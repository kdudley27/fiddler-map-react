import React from 'react'

class FilterComponent extends React.Component {
  // get the user input and send it back to our parent component
  handleChange(e) {
    const query = e.target.value;
    this.props.filterInput(query);
  }

  render() {
    return (
      <section id="filterComponent">
        <div className="filterContainer">
          <div className="filterIcon"></div>
          <input
            value={this.props.query}
            className="filterText"
            type="text"
            placeholder="enter text to filter results"
            onChange={this.handleChange.bind(this)}
            tabIndex='0'
            aria-label='filter restaurants by name'
          />
          <button
            className="clearQuery"
            onClick={()=> this.props.clearFilterInput()}
            aria-label="clear query"
            title="clear input text"
          ></button>
        </div>
      </section>
    );
  }
}

export default FilterComponent
