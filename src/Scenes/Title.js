class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create ()
    {
        this.text1 = this.add.text(300, 300, 'JUMP JUMP ALIEN', { font: "74px Arial Black", fill: "#fff" });
        this.text1.setStroke('#00f', 16);
        this.text1.setShadow(2, 2, "#333333", 2, true, true);
        const newScene = this.add.text(500, 400, "CLICK TO START", {
            fontFamily: "Arial",
            fontSize: 48,
            color: "#FFFFFF"
        });

        this.input.once("pointerdown", function () {
            this.scene.start("loadScene");
        }, this);
    }

    update ()
    {
    }
}