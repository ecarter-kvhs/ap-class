let player: Sprite = null
let level = 1

namespace SpriteKind {
    export const NewType = SpriteKind.create()
    export const Luggage = SpriteKind.create()
}

function setUpPlayer() {
    player = sprites.create(assets.image`player`, SpriteKind.Player)
    controller.moveSprite(player, 50, 0)
    scene.cameraFollowSprite(player)
    player.setStayInScreen(true)
    jump(player)
    switch (level) {
        case 1:
            player.setPosition(10, 160)
            break
    }
}

function setUpLuggage() {
    let luggageSpawns = tiles.getTilesByType(assets.tile`luggage-tile`)

    luggageSpawns.forEach((location) => {
        let luggageSprite = sprites.create(assets.image`luggage`, SpriteKind.Luggage)
        luggageSprite.setPosition(location.x, location.y)

        tiles.setTileAt(location, assets.tile`transparency16`)
    })
}

function setUpTilemap() {
    switch (level) {
        case 1:
            tiles.setCurrentTilemap(tilemap`level1_cargo_hold`)
            scene.setBackgroundColor(13)
            break
        default:
            game.gameOver(true)
    }
}

function startGame() {
    setUpTilemap()
    setUpLuggage()
    setUpPlayer()
}

function jump(sprite: Sprite, j?: number, g?: number ) {
    const grav =  g || 220
    const jump_const = j || -100
    sprite.ay = jump_const
    sprite.vy = jump_const
    while (sprite.ay < grav) {
        sprite.ay += Math.abs(sprite.vy)
    }
    sprite.ay = grav
}

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (player.isHittingTile(CollisionDirection.Bottom)) {
        jump(player)
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (player.isHittingTile(CollisionDirection.Bottom)) {
        jump(player)
    }
})

startGame()

scene.onHitWall(SpriteKind.Luggage, function (sprite, location) {
    sprite.vx = 0
    sprite.vy = 0
})

scene.onOverlapTile(SpriteKind.Player, assets.tile`door`, function(sprite: Sprite, location: tiles.Location) {
    sprites.destroy(player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Luggage)

    level++
    startGame()
}) 

sprites.onOverlap(SpriteKind.Player, SpriteKind.Luggage, function (sprite: Sprite, otherSprite: Sprite) {

    if (sprite.vx > 0 && !otherSprite.isHittingTile(CollisionDirection.Right)) {
        otherSprite.x += 1
        sprite.x -= 1
    }
    else if (otherSprite.isHittingTile(CollisionDirection.Right)) {
        sprite.x -= 3
    }

    if (sprite.vx < 0 && !otherSprite.isHittingTile(CollisionDirection.Left)) {
        otherSprite.x -= 1
        sprite.x += 1
    }
    else if (otherSprite.isHittingTile(CollisionDirection.Right)) {
        sprite.x += 3
    }

    let playerBottom = sprite.bottom
    let luggageTop = otherSprite.top

    if (sprite.vy > 0 && !controller.A.isPressed() && !controller.up.isPressed()) {
        sprite.bottom = luggageTop
        sprite.vy = 0
    } 
    else if (controller.A.isPressed() || controller.up.isPressed()) {
        jump(player)
    }
})