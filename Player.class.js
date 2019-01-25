class Player {
  static colorGenerator() {
    return Math.floor(Math.random() * 255)
      .toString(16)
      .padStart(2, '0');
  }
  static randomColor() {
    return `#${new Array(3).fill(0).map(Player.colorGenerator).join('')}`
  }

  static fromJSON(rawPlayer) {
    return Object.assign(new Player(), rawPlayer)
  }

  constructor({id, name}={}) {
    this.id = id || uid();
    this.name = name || this.id;

    this.level = 1;
    this.stuff = 0;
    this.modifier = 0;

    this.sex = Player.MALE;
    this.color = Player.randomColor();
  }

  get force() {
    return Math.max(this.level + this.stuff + this.modifier, 0)
  }

  switch() {
    this.sex = this.sex === Player.MALE ? Player.FEMALE : Player.MALE;
  }
}

Player.MALE = '♂';
Player.FEMALE = '♀';