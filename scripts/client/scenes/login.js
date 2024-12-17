class Login extends Phaser.Scene {
    constructor() {
        super({key: 'login'});
    }

    preload() {
        this.load.html('nameform', 'assets/dom/loginform.html');
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, 'background').setScale(1);
        this.add.image(screenCenterX, screenCenterY, 'background2').setScale(2);
        this.add.image(screenCenterX, screenCenterY-320, 'logo').setOrigin(0.5, 0.5).setScale(1);

        this.domElement = this.add.dom(screenCenterX, screenCenterY+20).createFromCache('nameform');
        this.domElement.addListener('click');

        this.domElement.on('click', (event) => {
            if(event.target.name === 'loginButton') {
                const inputUsername = this.domElement.getChildByName('username');

                this.checkLogin(inputUsername);
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            let usernameElement = (document.getElementById('username'));
            let focusedElement = (document.activeElement);
            if(focusedElement === usernameElement) this.checkLogin(usernameElement);
        });

        GameClient.loginScene = this;
    }

    checkLogin(inputUsername) {
        //Have they entered anything ?
        if (inputUsername.value !== '') {
            GameClient.username = inputUsername.value;

            GameClient.playerConnect();
        } else {
            //Flash the prompt
            this.shakeLoginMenu();
        }
    }

    loadTitleScene() {
        this.scene.start('title');
    }

    shakeLoginMenu() {
        this.tweens.add({targets: this.domElement, scale:1.05, duration: 100, ease: 'Power3', yoyo: true});
    }

}