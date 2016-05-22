/* eslint-disable max-len */
import React, { PropTypes } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRowColumn, TableRow } from 'material-ui/Table';
import SortIcon from 'material-ui/svg-icons/action/swap-vert';
import moment from 'moment';

export class DeviceTransactionTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.transactions,
    };
  }

  componentWillMount() {
    this.sortByColumn('date');
  }

  sortByColumn(column) {
    const sortedData = this.state.data;

    if (column === 'timespent') {
      sortedData.sort((a, b) => a.timespent - b.timespent);
    }

    if (column === 'date') {
      sortedData.sort((a, b) => {
        const timeA = moment(a.timestamp).format('x');
        const timeB = moment(b.timestamp).format('x');
        return timeB - timeA;
      });
    }

    if (column === 'amountspent') {
      sortedData.sort((a, b) => {
        const amountA = parseFloat(a.amountspent, 10);
        const amountB = parseFloat(b.amountspent, 10);
        return amountA - amountB;
      });
    }

    this.setState({
      data: sortedData,
    });
  }

  render() {
    return (
      <div>
        <Table >
          <TableHeader>
            <TableRow>
              <TableHeaderColumn style={{ width: '100px', paddingLeft: '0px' }}>
                <SortIcon color={'black'} id={"date"} onClick={(e) => this.sortByColumn(e.target.id)} />
                Date
              </TableHeaderColumn>
              <TableHeaderColumn style={{ width: '150px', paddingLeft: '0px' }}>
                <SortIcon color={'black'} id={"timespent"} onClick={(e) => this.sortByColumn(e.target.id)} />
                Usage
              </TableHeaderColumn>
              <TableHeaderColumn style={{ width: '100px', paddingLeft: '0px' }}>
                <SortIcon color={'black'} id={"amountspent"} onClick={(e) => this.sortByColumn(e.target.id)} />
                Payment
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.state.data.map((transaction, index) =>
              <TableRow key={index} style={{ color: 'black' }}>
                <TableRowColumn style={{ width: '150px' }}>{transaction.formattedTime}</TableRowColumn>
                <TableRowColumn style={{ width: '150px' }}>{transaction.formattedTimeSpent}</TableRowColumn>
                <TableRowColumn style={{ width: '100px' }}>${transaction.amountspent}</TableRowColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

DeviceTransactionTable.propTypes = {
  transactions: PropTypes.array.isRequired,
};

