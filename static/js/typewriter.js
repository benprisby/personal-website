class Typewriter {
    constructor(element, titles, options = {}) {
        this.element = element;
        this.titles = titles;
        this.typeSpeed = options.typeSpeed || 120;
        this.deleteSpeed = options.deleteSpeed || 60;
        this.pauseTime = options.pauseTime || 2500;

        setTimeout(() => this.start(), options.startDelay || 500);
    }

    async start() {
        this.element.classList.add('typewriter');

        while (true) {
            for (const title of this.titles) {
                await this.typeText(title);
                await this.sleep(this.pauseTime);
                await this.deleteText();
            }
        }
    }

    async typeText(text) {
        for (let i = 0; i <= text.length; i++) {
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.typeSpeed);
        }
    }

    async deleteText() {
        const text = this.element.textContent;
        for (let i = text.length; i >= 0; i--) {
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.deleteSpeed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const element = document.querySelector('#hero h2');
    const titles = element?.dataset.typewriterTitles;
    if (titles) {
        element.textContent = '';
        new Typewriter(element, JSON.parse(titles));
    }
});
