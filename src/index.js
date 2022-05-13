import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
  <button className={`square ${props.highlight ? 'highlight' : null}`} onClick={props.onClick}>
    {props.value}
  </button>
)
}

function Board(props) {
  const winnerIndex = props.winnerIndex
  let count = 0
  let board = []
  for(let row = 1; row <= 3; row++) {
    let squares = []
    for(let col = 1; col <= 3; col++) {
      const i = count
      let highlight = false
      if(winnerIndex && winnerIndex.includes(i)) {
        highlight = true
      }
      squares.push(
      <Square key={i}
        value={props.squares[i]} 
        highlight = {highlight}
        onClick={() => {props.onClick(row, col, i)}}
      />
      )
      count++
    }
    board.push(
      <div key={row} className="board-row">
      {squares}
    </div>
    )
  }
  return (
    <div>
      {board}
    </div>
  )
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        clickLocation: {
          row: 0,
          col: 0
        },
        step: 0
      }],
      stepNumber: 0,
      xISNext: true,
      sort: 'asc'
    }
  }

  handleClick(row, col, i) {
    let history
    const historyAll = this.state.history.slice()
    const currentIndex = historyAll.map((v) => v.step).indexOf(this.state.stepNumber)
    const current = historyAll[currentIndex]
    const squares = current.squares.slice()
    if(calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xISNext ? 'X' : 'O'
    const  stepNumber = this.state.stepNumber + 1
    const next = {
      squares: squares,
      clickLocation: {
        row: row,
        col: col
      },
      step:stepNumber
    }
    if(this.state.sort === 'asc') {
      history = this.state.history.slice(0, this.state.stepNumber + 1)
      history.push(next)
    }else {
      history = this.state.history.slice(currentIndex, this.state.history.length)
      history.unshift(next)
    }
    if( document.getElementsByClassName('current-click').length > 0) {
      document.getElementsByClassName('current-click')[0].classList.remove("current-click")
    }
    
    this.setState({
      history: history,
      stepNumber: stepNumber,
      xISNext: !this.state.xISNext
    })
    console.log('handleClick →　this.state ', this.state)
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xISNext: (step % 2) === 0,
    });
    if( document.getElementsByClassName('current-click').length > 0) {
      document.getElementsByClassName('current-click')[0].classList.remove("current-click")
    }
    document.getElementById(`${step}`).firstElementChild.setAttribute("class", "current-click")
  }

  handleSortHistoryClick() {
    const  history = this.state.history.slice()
    const sort = this.state.sort
    this.setState( {
      history: history.reverse(),
      sort: sort === 'asc' ? 'desc' : 'asc'
    })
  }

  render() {
    const history = this.state.history
    const current = history.filter((v) => v.step === this.state.stepNumber)[0]
    const winner = calculateWinner(current.squares)
    const moves = history.map((move) => {
      const desc = move.step ?
        'Go to move #' + move.step + ' (' + move.clickLocation.row + ',' + move.clickLocation.col + ')':
        'Go to game start'
        let clickClass = ''
        if(move.step === history.length -1) {
          clickClass = 'current-click'
        }
      return (
        <li key={move.step} id={move.step.toString()}>
          <button className={clickClass} onClick={() => this.jumpTo(move.step)}>{desc}</button>
        </li>
      )
    })
    let status
    if (winner) {
      status = 'Winner: ' + winner.winnerItem;
    } else {
      if(current.squares.filter((v) => v === null).length === 0) {
        status = '引き分け'
      }else {
        status = 'Next player: ' + (this.state.xISNext ? 'X' : 'O')
      }
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares = {current.squares}
            winnerIndex = {winner ? winner.winnerIndex : null}
            onClick = {(row, col, i) => this.handleClick(row, col, i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div style={{paddingTop: '10px'}}>
            <button onClick={() => this.handleSortHistoryClick()}>↑↓</button>
          </div>
          <ul>{moves}</ul>

        </div>
      </div>
    );
  }
}
// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winnerItem: squares[a],
        winnerIndex: lines[i]
      }
    }
  }
  return null;
}
