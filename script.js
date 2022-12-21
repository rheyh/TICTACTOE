const GameStateController = (() => {
  const Player = ((sign) => {
    let _sign = sign;

    const setSign = (sign) => _sign = sign;
    const getSign = () => _sign;
    
    return {setSign, getSign};
  });



  
  const GameBoard = (() => {
    let _gameBoard;

    
    const newGameBoard = () => _gameBoard = ['.', '.', '.', '.', '.', '.', '.', '.', '.', ];
    const getGameBoard = () => _gameBoard;
    const setSignToBoard = (sign, position) => _gameBoard[position] = sign;



   
    const computerMoves = (difficulty, human, computer) => {
      if(difficulty === 'baby') {
        return babyBotMoves();
      } else if (difficulty === 'ai') {
        return miniMaxAiMoves(_gameBoard, human, computer);
      }
    };
  

    
    const babyBotMoves = () => {
      let moves = Math.floor(Math.random() * 9);
      if(_gameBoard[moves] === '.'){
        return moves;
      } else {
        return babyBotMoves();
      }
    }


    
    const miniMaxAiMoves = (board, human, computer) => {
      let bestValue = -1000;
      let bestMove = -1;

      for(let i = 0; i < board.length; i++) {
        if (board[i] === '.') {
          board[i] = computer;
          let moveValue = minimax(board, human, computer, false);
          board[i] = '.';

          if (moveValue > bestValue) {
            bestMove = i;
            bestValue = moveValue;
          }    
        }
      }
      
      return bestMove;
    }
           
    function evaluate(board, human, computer) {
      if(isWinner(board, human)) {
        return -10;
      } else if(isWinner(board, computer)) {
        return 10;
      } else {
        return 0;
      }
    }
    
 
    function minimax(board, human, computer, isMax) {
      let score = evaluate(board, human, computer);

      if (score !== 0) {
        return score;
      }
    
      if (isDraw(board)) {
        return 0;
      }
    
      if(isMax) {
        let best = -1000;
        for(let i = 0; i < 9; i++) {
          if(board[i]=='.') {
              board[i] = computer;
              best = Math.max(best, minimax(board, human, computer, !isMax));
              board[i] = '.';
          }  
        }
        return best;
      } else {
        let best = 1000;
        for(let i = 0; i < 9; i++) {
          if(board[i] == '.') {
              board[i] = human;
              best = Math.min(best, minimax(board, human, computer, !isMax));
              board[i] = '.';
          }
        }
        return best;
      }
    }


    
   
    const isDraw = (board) =>  !(board.includes('.'));
    const isWinner = (board, sign) => checkVertically(board, sign) || checkHorizontally(board, sign) || checkDiagonally(board, sign);

    const checkVertically = (board, sign) => {
      for(let i = 0; i < board.length; i+=3) {
        if(board[i] === sign && board[i + 1] === sign && board[i + 2] === sign) {
          return true;
        }
      }

      return false;
    }

    const checkHorizontally = (board, sign) => {
      for(let i = 0; i < board.length; i++) {
        if(board[i] === sign && board[i + 3] === sign && board[i + 6] === sign) {
          return true;
        }
      }

      return false;
    }

    const checkDiagonally = (board, sign) => {
      if(board[0] === sign && board[4] === sign && board[8] === sign) {
        return true;
      } else if (board[2] === sign && board[4] === sign && board[6] === sign) {
        return true;
      } else {
        return false;
      }
    }

    return {getGameBoard, newGameBoard, setSignToBoard, computerMoves, isDraw, isWinner};
  })();

  return {Player, GameBoard}
})();



const DisplayController = (() =>{
  
  
  const modal = document.querySelector(".modal");
  const result = document.getElementById("result");
  const board = document.getElementById('board');
  const xButton = document.getElementById('X');
  const oButton = document.getElementById('O');
  const form = document.getElementById('difficulty');

  
  
  
  const human = GameStateController.Player('X', true);
  const computer = GameStateController.Player('O', false);
  const logicBoard = GameStateController.GameBoard;

  
  

  let isDisplayed = false;
  let isDisabled = false
  
  const toggleIsDisabled = () => isDisabled = !isDisabled;
  const toggleIsDisplayed = () => isDisplayed = !isDisplayed;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  
  
  
 
  const createDisplayBoard =  () => {
    for (let position = 0; position < (3 * 3); position++) {
      let grid = document.createElement("div");
      
      grid.addEventListener("click", async () => {
        
       
        if(logicBoard.getGameBoard()[position] === '.' && !isDisabled) {
          displayHumanMoves(position);
          await delay(500);
       
          if(!isDisplayed){
            displayComputerMoves();
          }
        }
      });
      
      board.appendChild(grid).className = "grid-item";
    };
  };
  
  const clearDisplayBoard = () => board.innerHTML = '';
  
  
  

  let difficulty = 'baby';

  const changeSign = (sign) => {
    computer.setSign(human.getSign());
    human.setSign(sign);
    
    xButton.disabled  = !xButton.disabled;
    oButton.disabled  = !oButton.disabled;
    restartMatch();
  };

  form.addEventListener('change', () => {
    const value = document.querySelector('#difficulty').value;
    if (value == 'baby') {
      difficulty = 'baby';
    } else if (value == 'ai') {
      difficulty = 'ai';
    }
  
    restartMatch();
  });

  


  const displayHumanMoves = (position) => {
    toggleIsDisabled();
    setTimeout(function() { toggleIsDisabled() }, 1000);

    moves(human.getSign(), position);
  }
  
  const displayComputerMoves = () => {      
    const position = logicBoard.computerMoves(difficulty, human.getSign(), computer.getSign());

    moves(computer.getSign(), position);
  }

  const moves = (sign, position) => {
    const grid = document.querySelectorAll('.grid-item');

    logicBoard.setSignToBoard(sign, position);
    grid[position].innerHTML = sign;

    //animate fade in
    grid[position].animate([
      { opacity: '0' },
      { opacity: '1' },
    ], { duration: 500 });
    
    
    checkResult(sign);
  };



  const checkResult = (sign) => {
    if(logicBoard.isWinner(logicBoard.getGameBoard(), sign)) {
      displayResult(`${sign} Win`);
    } else if(logicBoard.isDraw(logicBoard.getGameBoard())) {
      displayResult(`It's a Draw`);
    }
  }

  const displayResult = async (text) => {
    result.innerHTML = text;
   
    await delay(500);
    modal.classList.toggle("show-modal");
    toggleIsDisplayed();
    
  }



  
  const restartMatch = () => {
    logicBoard.newGameBoard();

    clearDisplayBoard();
    createDisplayBoard();
    
    if(isDisplayed) {
      modal.classList.toggle("show-modal");
      toggleIsDisplayed();
    }
    
    if(computer.getSign() === 'X'){
      displayComputerMoves();
    }
  };

  return {changeSign, restartMatch};
})();


DisplayController.restartMatch();
