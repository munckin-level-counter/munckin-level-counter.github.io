Vue.component('form-player', {
  props: ['player'],
  template: document.querySelector('#form-player-component').innerHTML,
  data() {
    return {
      levelInput: [
        {icon: 'add', handler: this.levelIncrement},
        {icon: 'remove', handler: this.levelDecrement},
      ],
      stuffInput: [
        {icon: 'add', handler: this.stuffIncrement},
        {icon: 'remove', handler: this.stuffDecrement},
      ],
      modifierInput: [
        {icon: 'add', handler: this.modifierIncrement},
        {icon: 'remove', handler: this.modifierDecrement},
      ],
    }
  },
  methods: {
    levelIncrement() {
      this.player.level += 1
    },
    levelDecrement() {
      this.player.level -= 1
    },
    stuffIncrement() {
      this.player.stuff += 1
    },
    stuffDecrement() {
      this.player.stuff -= 1
    },
    modifierIncrement() {
      this.player.modifier += 1
    },
    modifierDecrement() {
      this.player.modifier -= 1
    },
    remove() {
      app.removePlayer(this.player)
    }
  }
});