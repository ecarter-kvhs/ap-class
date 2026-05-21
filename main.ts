let player: Sprite = null
let luggage: Sprite = null
namespace SpriteKind {
    export const NewType = SpriteKind.create()
}

function setUpPlayer() {
    player = sprites.create(assets.image`player`, SpriteKind.Player)
    controller.moveSprite(player, 50, 0)
    scene.cameraFollowSprite(player)
    player.setStayInScreen(true)
    jump(player)
    player.setPosition(10, 160)
}

function setUpLuggage() {
luggage = sprites.create(assets.image`luggage-1`, SpriteKind.Luggage)
}

function setUpTilemap() {
    tiles.setCurrentTilemap(tilemap`test_level`)
}

function startGame() {
    setUpPlayer()
    setUpTilemap()
    setUpLuggage()
}

function jump(sprite: Sprite) {
    const grav = 220
    const jump_const = -100
    sprite.ay = jump_const
    sprite.vy = jump_const
    while (sprite.ay < grav) {
        sprite.ay += Math.abs(sprite.vy)
    }
    sprite.ay = grav
}

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if(player.isHittingTile(CollisionDirection.Bottom)){
        jump(player)
    }
})

startGame()