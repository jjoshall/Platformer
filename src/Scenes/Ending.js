class Ending extends Phaser.Scene {
    constructor() {
        super("endingScene");
    }

    preload() {
        this.load.setPath("./assets/");
    }

    create() {
        console.log("blah");
        const endText = this.add.text(450, 300, "NO LIVES LEFT", {
            fontFamily: "Arial",
            fontSize: 64,
            color: "#FF0000"
        });
        const newScene = this.add.text(460, 400, "CLICK TO RESTART", {
            fontFamily: "Arial",
            fontSize: 48,
            color: "#FFFFFF"
        });

        this.input.once("pointerdown", function () {
            this.scene.start("loadScene");
        }, this);
    }

    update() {}
}