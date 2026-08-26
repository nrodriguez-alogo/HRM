/* // Class definition
class Horse {

  // Constructor: runs when you create a new object
  constructor(tail_number, status) {

    // Store the data
    this.tail_number = tail_number;
    this.status = status;
  }
  
  // validate: checks if the data is correct
  validate() {
    if (!this.tail_number) {
      throw new Error("Tail number required");
    }
    if (!this.status) {
      throw new Error("Status required");
    }
  }
}

// Exporting aircraft class
module.exports = Horse; */