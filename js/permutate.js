var permutate = {

  results: [],

  doPermute: function (input, output, used, size, level) {

    if (size == level) {
      var word = output.join('');
      this.results.push(word);
      return;
    }

    level++;

    for (var i = 0; i < input.length; i++) {

      if (used[i] === true) {
        continue;
      }

      used[i] = true;

      output.push(input[i]);

      this.doPermute(input, output, used, size, level);

      used[i] = false;

      output.pop();
    }
  },

  get: function (input, size) {
    var chars = input.split('');
    var output = [];
    var used = new Array(chars.length);

    this.doPermute(chars, output, used, size, 0);

    return this.results;
  }

};