const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

const app = new Vue({
  el: '#level-counter',
  data: {
    players: [new Player(), new Player(), new Player()],
    get selected() {
      return this.l.selected[0];
    },
    set selected(player) {
      this.l.selected[0] = player
    },
    roll: 6,
    l: {
      selected: [],
      showLeft: false,
      showRight: false,
    },
    playersColumns: [
      {
        name: 'id',
        field: 'id',
      },
      {
        name: 'name',
        field: 'name',
        label: 'Name',
        align: 'left',
        sortable: true,
      },
      {
        name: 'level',
        field: 'level',
        label: 'Level',
        align: 'right',
        sortable: true,
      },
      {
        name: 'force',
        field: 'force',
        label: 'Force',
        align: 'right',
        sortable: true,
      },
    ],
  },
  created() {
    this.select(this.players[0]);
    this.rollDice();
  },
  methods: {
    rollIcon() {
      switch(this.roll) {
        case 1:
          return 'looks_one';
        case 2:
          return 'looks_two';
        default:
          return `looks_${this.roll}`;
      }
    },
    addPlayer() {
      const player = new Player();
      this.players.push(player);

      if (this.selected) return;
      this.select(player);
    },
    select(player) {
      this.selected = player;
      
      this.$refs.players.selected = player;
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