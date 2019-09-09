const $ = (selector, ctx=document) => selector instanceof Element ? selector : ctx.querySelector(selector);

class Prompt {
  static get templateId() {
    return 'dialog-prompt';
  }

  static get template() {
    return `
<dialog id="${this.templateId}">
    <form method="dialog">
        <h1><span><!-- Insert your title here --></span> <button style="float: right">×</button></h1>
        <p><label for="dialog-prompt-textarea"><!-- Insert your message here --></label></p>
        <p><textarea id="dialog-prompt-textarea" cols="30" rows="10"><!-- Insert your placeholder here --></textarea></p>
        <div>
            <input type="reset" value="Reset form">
            <input type="submit" formmethod="dialog" value="Close dialog">
            <button type="submit" value="">Confirm</button>
        </div>
    </form>
</dialog>
    `;
  }

  /**
   * @returns {Prompt}
   */
  static get () {
    let dialog = $(`#${this.templateId}`)
      || document.body.insertAdjacentHTML('afterbegin', this.template)
      || $(`#${this.templateId}`);

    if (Prompt.dialog) return Prompt.dialog;

    return new Prompt(dialog);
  }

  constructor(dialog) {
    if (Prompt.dialog) throw new Error('Please use Prompt.get instead new Prompt');

    this.dialog = dialog;
    this.form = $('form', this.dialog);

    this.question = $('label', this.dialog);
    this.response = $('textarea', this.dialog);

    this.submit = $('button[type=submit]', this.dialog);
    this.close = $('h1 button', this.dialog);

    this.response.addEventListener('change', e => this.submit.value = this.response.value);
    this.close.addEventListener('click', e => this.dialog.close());

    Prompt.dialog = this;
  }

  /**
   * @param {string} message
   * @param {string} title
   * @param {string} placeholder
   *
   * @returns {Promise<string>}
   */
  prompt(message, title='Modal title', placeholder='') {
    this.question.textContent = message;
    this.response.value = placeholder;

    this.dialog.show();

    return new Promise((resolve, reject) => {
      this.dialog.addEventListener('close', () => resolve(this.dialog.returnValue), {once: true});
      this.dialog.addEventListener('cancel', () => reject(new Error('User cancel prompt')), {once: true});
    });
  }

  /**
   * @returns {boolean}
   */
  isOpen() {
    return this.dialog.open
  }

  /**
   * @returns {boolean}
   */
  isClose() {
    return !this.dialog.open
  }
}
Prompt.dialogs = new Map();
