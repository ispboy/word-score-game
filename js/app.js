$(document).ready(function () {
  init_word_list(); //load dictionary
  init_bag();  //load letters to bag
  Hand.init();
  Hand.addNumbersFromBag();
});

var Bag = {
  letters: [],
  display: function () {
    $("#bag").text(Bag.letters.length);
  },
  getAvailableLetter: function () {
    var randomIndex = Math.floor(Math.random() * this.letters.length);
    var randomLetter = this.letters.splice(randomIndex, 1);
    if (randomLetter.length === 0) {
    } else {
      return randomLetter[0];
    }
  }
};

var Hand = {
  letters: [],
  words: [],
  init: function () {
    $("#find-word-button").click(function () {
      Hand.findWordToUse();
    });
    $("#human-find-word-button").click(function () {
      var word = $("#human-word-input").val();
      if (word.length > 1) {
        Hand.humanFindWordToUse(word);
      }
    });
    $("#retire-hand-button").click(function () {
      Hand.retireHand();
    });
    $('#human-word-input').keypress(function (event) {
      if (event.which == 13) {
        $("#human-find-word-button").click();
      }
    });
  },
  addNumbersFromBag: function () {
    var l = this.letters.length;
    for (var i = l; i < 7; i++) {
      var letter = Bag.getAvailableLetter();
      if (letter) {
        this.letters[i] = letter;
      }
    }

    this.display();
    Bag.display();
  },

  display: function () {
    for (var i = 0; i < this.letters.length; i++) {
      var n = i + 1;
      if (this.letters[i]) {
        $("#letter-" + n).text(this.letters[i].letter);
        $("#points-" + n).text(this.letters[i].pointsWhenLettersUsed);

      }
    }
  },

  findWordToUse: function () {
    var letters = '';
    var words = [];
    permutate.results = [];
    for (var i = 0; i < this.letters.length; i++) {
      letters += (this.letters[i].letter);
    }

    for (i = 1; i < this.letters.length; i++) {
      words = permutate.get(letters, i + 1);
    }

    var humanFoundWord = "";
    for (i = 0; i < words.length; i++) {
      humanFoundWord = words[i];
      if (!Word_List.isInList(humanFoundWord)) {
        words.splice(i, 1);
        i--;
      }
    }

    if (words.length ===0) {
      return false;
    }

    for (i = 0; i < words.length; i++) {
      this.resetLetter();
      this.haveLettersForWord(words[i]);
    }

    this.words.sort(function(a,b) {
      return b.point - a.point;
    });
    
    this.successfullyAddedWord(this.words[0].word);
    
    console.log(this.words);

    this.words = [];

  },

  humanFindWordToUse: function (humanFoundWord) {
    console.log("Checking human workd of:" + humanFoundWord);
    if (Word_List.isInList(humanFoundWord)) {
      if (this.haveLettersForWord(humanFoundWord)) {
        this.successfullyAddedWord(humanFoundWord);
      } else {
        alert(humanFoundWord + " - Do not have the letters for this word");
      }
    } else {
      alert(humanFoundWord + " is not a valid word.");
    }
  },

  haveLettersForWord: function (aProposedWord) {
    //You could code the _ logic could go in this function
    var point = 0;
    var wordAsArray = aProposedWord.toUpperCase().split("");
    for (var i = 0; i < wordAsArray.length; i++) {
      var foundLetter = false;
      //console.log(aProposedWord[i] + "<-For match");
      for (var ii = 0; ii < this.letters.length; ii++) {
        if (this.letters[ii].letter == wordAsArray [i]) {
          if (!this.letters[ii].used && !foundLetter) {
            this.letters[ii].used = true;
            foundLetter = true;
            point += this.letters[ii].pointsWhenLettersUsed;
            break;
          }
        }
      }

      if (!foundLetter) {
        this.resetLetter(); //set all letter in bag as unused.
        return false;
      }
    }

    this.words.push({word: aProposedWord, point: point});

    return true;
  },

  resetLetter: function () {
    for (var i = 0; i < this.letters.length; i++) {
      this.letters[i].used = false;
    }
  },

  retireHand: function () {
    //Loose all the points in your hand
    this.letters = [];
    $(".letter").text('');
    $(".point").text('');
    this.addNumbersFromBag();
    if (this.letters.length === 0) {
      alert("Your bag is empty, Byebye!"); //Game over!
    }
  },

  successfullyAddedWord: function (foundWord) {
    for (var i = 0; i < this.letters.length; i++) {
      if (this.letters[i].used) {
        Score.total += this.letters[i].pointsWhenLettersUsed;
        this.letters.splice(i, 1);
        i -= 1;
      }
    }

    $("#human-word-input").val('');
    Score.history.push(foundWord);
    Score.display();
    this.addNumbersFromBag();

  }
};

var Score = {
  total: 0,
  history: [],
  display: function () {
    $("#score-number").text(this.total);
    $("#word-history-list").html("");
    for (var i = 0; i < this.history.length; i++) {
      $("#word-history-list").append("<li>" + this.history[i] + "</li>");
    }
  }
};

var Word_List = {

  wordBank: [],

  loadBank: function (wordArray) {
    var character = wordArray[12].charAt(0);
    if (!character) {
      throw "Not able to get first letter from word to determine word bank.";
    }
    this.wordBank[character] = wordArray;
  },

  //Create method for checking if word is in list
  isInList: function (toCheck) {

    toCheck = toCheck.toLowerCase();
    var letter = toCheck.charAt(0);

    //wordBank will be an array initialized with the full word list, indexed by letter.
    return (this.wordBank[letter].indexOf(toCheck) > -1);

  }

};

function Letter(letter, numberOfStartingTiles, pointsWhenLettersUsed) {
  this.letter = letter;
  this.numberOfStartingTiles = numberOfStartingTiles;
  this.pointsWhenLettersUsed = pointsWhenLettersUsed;
  this.tilesUsed = 0;
  this.used = false;

  this.remainingTiles = function () {
    if ((this.numberOfStartingTiles - this.tilesUsed) > 0) {
      return (this.numberOfStartingTiles - this.tilesUsed);
    } else {
      return 0;
    }
  };
  this.useTile = function () {
    if ((this.numberOfStartingTiles - this.tilesUsed) > 0) {
      this.tilesUsed++;
      return true;
    } else {
      return false;
    }
  };

}