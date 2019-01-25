const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

const app = new Vue({
  el: '#level-counter',
  data: {
    players: [new Player(), new Player(), new Player()],
    selected: null,
    roll: 6,
  },
  created() {
    this.select(this.players[0]);
    this.rollDice();
  },
  methods: {
    addPlayer() {
      const player = new Player();
      this.players.push(player);

      if (this.selected) return;
      this.select(player);
    },
    select(player) {
      this.selected = player
    },
    isActive(player) {
      return this.selected === player
    },
    isEmpty() {
      return this.players.length === 0;
    },
    previous() {
      if (this.isEmpty()) return;

      let index = this.players.indexOf(this.selected) - 1;
      if (index < 0) index = this.players.length + index;

      this.select(this.players[index]);
    },
    next() {
      if (this.isEmpty()) return;

      let index = this.players.indexOf(this.selected) + 1;
      index %= this.players.length;

      this.select(this.players[index]);
    },
    removePlayer(player) {
      player = player || this.selected;

      let index = this.players.indexOf(player);
      this.players.splice(index, 1);

      index = index % this.players.length;
      this.select(this.players[index || 0]);
    },
    rollDice() {
      this.roll = Math.floor(Math.random() * 6) + 1
    }
  }
});